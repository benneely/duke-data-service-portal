import React from 'react';
import ReactDOM from 'react-dom';
import {graphOptions, graphColors} from '../../graphConfig';
import ProjectActions from '../../actions/projectActions';
import ProjectStore from '../../stores/projectStore';
import ProvenanceActivityManager from '../globalComponents/provenanceActivityManager.jsx';
import ProvenanceDetails from '../globalComponents/provenanceDetails.jsx';
import ProvenanceFilePicker from '../globalComponents/provenanceFilePicker.jsx';
import FileVersionsList from '../fileComponents/fileVersionsList.jsx';
import BaseUtils from '../../../util/baseUtils.js';
import AutoComplete from 'material-ui/AutoComplete';
import BorderColor from 'material-ui/svg-icons/editor/border-color';
import Cancel from 'material-ui/svg-icons/navigation/cancel';
import CircularProgress from 'material-ui/CircularProgress';
import Dialog from 'material-ui/Dialog';
import Divider from 'material-ui/Divider';
import FlatButton from 'material-ui/FlatButton';
import Fullscreen from 'material-ui/svg-icons/navigation/fullscreen';
import FullscreenExit from 'material-ui/svg-icons/navigation/fullscreen-exit';
import Help from 'material-ui/svg-icons/action/help';
import IconButton from 'material-ui/IconButton';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';

class Provenance extends React.Component {
    /**
     * Creates a provenance graph using the Vis.js library
     * Uses a network graph from Vis.js
     * Vis docs @ visjs.org/docs/network/
     */

    constructor(props) {
        super(props);
        this.state = {
            doubleClicked: false,
            errorText: null,
            floatingErrorText: 'This field is required.',
            height: window.innerHeight,
            network: null,
            node: null,
            projectId: 0,
            relationMode: false,
            value: null,
            width: window.innerWidth
        };
        this.handleResize = this.handleResize.bind(this);
    }

    componentDidMount() {
        // Listen for resize changes when rotating device
        window.addEventListener('resize', this.handleResize);
        ProjectActions.getProjects();
        ProjectActions.getActivities();
        if(this.props.provNodes && this.props.provNodes.length > 0) {
            let edges = this.props.provEdges && this.props.provEdges.length > 0 ? this.props.provEdges : [];
            let nodes = this.props.provNodes && this.props.provNodes.length > 0 ? this.props.provNodes : [];
            this.renderProvGraph(edges, nodes);
        }
    }

    componentWillUpdate(nextProps, nextState) {
        let scale = this.props.scale;// Todo: Remove this if not using saveZoomState
        let position = this.props.position;// Todo: Remove this if not using saveZoomState
        let edges = this.props.provEdges && this.props.provEdges.length > 0 ? this.props.provEdges : [];
        let nodes = this.props.provNodes && this.props.provNodes.length > 0 ? this.props.provNodes : [];
        if(nextProps.updatedGraphItem !== this.props.updatedGraphItem && nextProps.updatedGraphItem.length > 0){
            this.renderProvGraph(edges, nodes, scale, position);// Todo: Remove extra params if not using saveZoomState
        }
    }

    componentDidUpdate(prevProps, prevState) {
        let edges = this.props.provEdges && this.props.provEdges.length > 0 ? this.props.provEdges : [];
        let nodes = this.props.provNodes && this.props.provNodes.length > 0 ? this.props.provNodes : [];
        if(prevProps.provEdges !== this.props.provEdges || prevProps.provNodes !== this.props.provNodes){
            //Check if addEdgeMode has changed. If true render graph in add edge mode or with newly added edge
            this.renderProvGraph(edges, nodes);
            ProjectActions.toggleGraphLoading();
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    handleResize(e) {
        this.setState({
            height: window.innerHeight,
            width: window.innerWidth
        })
    }

    renderProvGraph(edge, node, scale, position) {
        let edges = new vis.DataSet(edge);
        let nodes = new vis.DataSet(node);

        let onAddEdgeMode = (data, callback) => {
            let nodes = ProjectStore.provNodes;
            let relationKind = null;
            if(data.from == data.to) {
                callback(null);
            } else {
                switch(this.state.value){
                    case 0:
                        relationKind = 'used';
                        break;
                    case 1:
                        relationKind = 'was_generated_by';
                        break;
                    case 2:
                        relationKind = 'was_derived_from';
                        break;
                }
                ProjectActions.saveGraphZoomState(this.state.network.getScale(), this.state.network.getViewPosition());
                ProjectActions.getFromAndToNodes(data, relationKind, nodes);
                ProjectActions.toggleAddEdgeMode();
                if(this.props.showProvDetails) ProjectActions.toggleProvNodeDetails();
                if(this.props.showProvCtrlBtns) ProjectActions.showProvControlBtns();
                this.setState({value: null, relationMode: !this.state.relationMode});
                callback(null); // Disable default behavior and update dataset in the store instead
            }
        };
        // create a network
        let data = {
            nodes: nodes,
            edges: edges
        };
        // import options from graphConfig
        let options = graphOptions;
        let container = ReactDOM.findDOMNode(this.refs.graphContainer);
        // remove old contents of dom node
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        this.state.network = new vis.Network(container, data, options);
        //Add manipulation options to network options so that addEdgeMode is defined
        this.state.network.setOptions({manipulation: {
            enabled: false,
            addEdge: onAddEdgeMode
        }});
        if(scale !== null && position !== null) {
            this.state.network.moveTo({
                position: position,
                scale: scale
            });
        }
        let hideButtonsOnDblClk = ()=> {
            this.state.doubleClicked = true;
            setTimeout(()=>{
                this.state.doubleClicked = false;
            }, 300)
        };
        this.state.network.on("select", (params) => {
            let nodeData = nodes.get(params.nodes[0]);
            let edgeData = edges.get(params.edges);
            // User has visibility to node or it's an edge that is selected
            if (params.nodes.length > 0) this.setState({node: nodeData});
            if (params.nodes.length === 0) this.setState({showDetails: false});
            ProjectActions.selectNodesAndEdges(edgeData, nodeData);
        });
        this.state.network.on("doubleClick", (params) => { // Show more nodes on graph on double click event
            let nodeData = nodes.get(params.nodes[0]);
            if (!Array.isArray(nodeData) && nodeData.properties.hasOwnProperty('audit')) {
                hideButtonsOnDblClk();
                let prevGraph = {nodes: this.props.provNodes, edges: this.props.provEdges};
                if (params.nodes.length > 0) {
                    let id = this.state.node.properties.current_version ? this.state.node.properties.current_version.id : this.state.node.properties.id;
                    let kind = this.state.node.properties.kind === 'dds-activity' ? 'dds-activity' : 'dds-file-version';
                    nodeData.properties.kind === 'dds-activity' ?  ProjectActions.getProvenance(id, kind, prevGraph) :
                        ProjectActions.getWasGeneratedByNode(id, kind, prevGraph);
                }
            }
        });
        this.state.network.on("click", (params) => {
            let nodeData = nodes.get(params.nodes[0]);
            let edgeData = edges.get(params.edges);
            if (!Array.isArray(nodeData) && nodeData.properties.hasOwnProperty('audit') || edgeData.length === 1) {
                if (params.nodes.length > 0) {
                    if (!this.props.showProvDetails && nodeData.properties.hasOwnProperty('audit')) ProjectActions.toggleProvNodeDetails();
                    if (this.props.showProvDetails && !nodeData.properties.hasOwnProperty('audit')) ProjectActions.toggleProvNodeDetails();
                    if (nodeData.properties.kind !== 'dds-activity') {
                        if (!this.props.removeFileFromProvBtn) ProjectActions.showRemoveFileFromProvBtn();
                    } else {
                        if (nodeData.properties.audit.created_by.id !== this.props.currentUser.id && this.props.showProvCtrlBtns) {
                            ProjectActions.showProvControlBtns();
                        }
                        if (nodeData.properties.audit.created_by.id === this.props.currentUser.id) {// If not creator then don't allow edit/delete activity
                            if (!this.props.showProvCtrlBtns && nodeData.properties.kind === 'dds-activity') ProjectActions.showProvControlBtns();
                            if (nodeData.properties.kind !== 'dds-activity' && this.props.showProvCtrlBtns) {
                                this.state.network.unselectAll();
                                ProjectActions.showProvControlBtns();
                            }
                            if (nodeData.properties.kind !== 'dds-activity' && this.props.dltRelationsBtn) {
                                this.state.network.unselectAll();
                                ProjectActions.showDeleteRelationsBtn(edgeData, nodeData);
                            }
                        }
                    }
                }
                if (params.nodes.length === 0) {
                    this.state.network.unselectAll();
                    if (edgeData.length > 0) this.state.network.selectEdges([edgeData[0].id]);
                    if (this.props.removeFileFromProvBtn) ProjectActions.showRemoveFileFromProvBtn();
                    if (this.props.showProvCtrlBtns) ProjectActions.showProvControlBtns();
                }
                if (params.edges.length === 0 && this.props.dltRelationsBtn) {
                    if (this.props.showProvDetails) ProjectActions.toggleProvNodeDetails();
                    ProjectActions.showDeleteRelationsBtn(edgeData);
                    this.state.network.unselectAll();
                }
                if (params.edges.length === 0 && params.nodes.length === 0 && this.props.showProvDetails) ProjectActions.toggleProvNodeDetails();
                if (edgeData.length > 0 && params.nodes.length < 1) {
                    if (this.props.showProvDetails) ProjectActions.toggleProvNodeDetails();
                    if (edgeData[0].type !== 'WasAssociatedWith' || edgeData[0].type !== 'WasAttributedTo') {
                        if (edgeData.length > 0 && edgeData[0].properties.audit.created_by.id !== this.props.currentUser.id && this.props.dltRelationsBtn) {
                            ProjectActions.showDeleteRelationsBtn(edgeData);
                        }
                        if (edgeData.length > 0 && edgeData[0].properties.audit.created_by.id === this.props.currentUser.id) {
                            if (params.edges.length > 0 && params.nodes.length < 1) {
                                if (!this.props.dltRelationsBtn) ProjectActions.showDeleteRelationsBtn(edgeData);
                                if (this.props.showProvCtrlBtns && this.props.dltRelationsBtn) ProjectActions.showDeleteRelationsBtn(edgeData);
                            }
                        }
                    }
                }
            } else {
                this.state.network.unselectAll();
                if (this.props.showProvDetails) ProjectActions.toggleProvNodeDetails();
                if (this.props.showProvCtrlBtns) ProjectActions.showProvControlBtns();
                if (this.props.dltRelationsBtn) ProjectActions.showDeleteRelationsBtn(edgeData, nodeData);
            }
        })
    }

    render() {
        let fileName = this.props.entityObj && this.props.entityObj.name ? this.props.entityObj.name : null;
        if(fileName === null) fileName = this.props.entityObj ? this.props.entityObj.file.name : null;
        let fileVersion = this.props.entityObj && this.props.entityObj.current_version ? this.props.entityObj.current_version.version : null;
        if(fileVersion === null) fileVersion = this.props.entityObj ? this.props.entityObj.version : null;
        let addFile = this.props.provEditorModal.id !== null && this.props.provEditorModal.id === 'addFile' ? this.props.provEditorModal.open : false;
        let addAct = this.props.provEditorModal.id !== null && this.props.provEditorModal.id === 'addAct' ? this.props.provEditorModal.open : false;
        let dltAct = this.props.provEditorModal.id !== null && this.props.provEditorModal.id === 'dltAct' ? this.props.provEditorModal.open : false;
        let dltRel = this.props.provEditorModal.id !== null && this.props.provEditorModal.id === 'dltRel' ? this.props.provEditorModal.open : false;
        let editAct = this.props.provEditorModal.id !== null && this.props.provEditorModal.id === 'editAct' ? this.props.provEditorModal.open : false;
        let nodeWarning = this.props.provEditorModal.id !== null && this.props.provEditorModal.id === 'nodeWarning' ? this.props.provEditorModal.open : false;
        let openRelWarn = this.props.provEditorModal.id !== null && this.props.provEditorModal.id === 'relWarning' ? this.props.provEditorModal.open : false;
        let openConfirmRel = this.props.provEditorModal.id !== null && this.props.provEditorModal.id === 'confirmRel' ? this.props.provEditorModal.open : false;
        let drvFrmMsg = this.props.relMsg && this.props.relMsg === 'wasDerivedFrom' ?
            <h5>Only<u><i>Was Derived From</i></u> relations can go
                <u><i> from </i></u> files <u><i>to</i></u> files.</h5> : '';
        let invalidRelMsg = this.props.relMsg && this.props.relMsg === 'invalidRelMsg' ?
            <h5>A relation can not be created between these entity types.</h5> : '';
        let actToActMsg = this.props.relMsg && this.props.relMsg === 'actToActMsg' ?
            <h5>An <u><i>activity</i></u> can not have a relation to another <u><i>activity</i></u></h5> : '';
        let notFileToFile = this.props.relMsg && this.props.relMsg === 'notFileToFile' ?
            <h5><u><i>Was Derived From</i></u> relations can only be created <u><i>from </i></u>
                files <u><i>to</i></u> files.</h5> : '';
        let permissionError = this.props.relMsg && this.props.relMsg === 'permissionError' ?
            <h5>Your can only create <u><i>used </i></u> relations from activities you are the creator of.</h5> : '';
        let prjPrm = this.props.projPermissions && this.props.projPermissions !== undefined ? this.props.projPermissions : null;
        let relationInstructions = null;
        switch(this.state.value){
            case 0:
                relationInstructions = <span><span style={styles.relationInstructions}>You are adding a Used relation</span>
                    <br/>Click on an activity node and<br/> drag to a file node
                   to show that the<br/> activity used that file.</span>;
                break;
            case 1:
                relationInstructions = <span><span style={styles.relationInstructions}>You are adding a <br/>Was Generated By relation</span>
                    <br/>Click on a file node and drag to <br/>an activity node to show that the <br/>activity
                    generated that file.</span>;
                break;
            case 2:
                relationInstructions = <span><span style={styles.relationInstructions}>You are adding a <br/>Was Derived From relation</span>
                    <br/>Click on a file node and drag to <br/>another file node to show that the <br/>file is a derivation of another
                    file.<br/> You will then have the option to<br/> confirm which file was the derivative.</span>;
                break;
        }
        let relationTypeSelect = null;
        if(prjPrm !== null) {
            relationTypeSelect = prjPrm === 'viewOnly' ?
                <SelectField value={this.state.value}
                             id="selectRelation"
                             onChange={this.handleSelectValueChange.bind(this, 'value')}
                             floatingLabelText="Select Relation Type"
                             floatingLabelStyle={styles.selectStyles.floatingLabel}
                             errorText={this.state.errorText}
                             errorStyle={styles.textStyles}
                             labelStyle={styles.selectStyles.label}
                             iconStyle={styles.selectStyles.icon}
                             style={styles.selectStyles}>
                    <MenuItem value={0} primaryText='used'/>
                </SelectField>:
                <SelectField value={this.state.value}
                             id="selectRelation"
                             onChange={this.handleSelectValueChange.bind(this, 'value')}
                             floatingLabelText="Select Relation Type"
                             floatingLabelStyle={styles.selectStyles.floatingLabel}
                             errorText={this.state.errorText}
                             errorStyle={styles.textStyles}
                             labelStyle={styles.selectStyles.label}
                             iconStyle={styles.selectStyles.icon}
                             style={styles.selectStyles}>
                    <MenuItem value={0} primaryText='used'/>
                    <MenuItem value={1} primaryText='was generated by'/>
                    <MenuItem value={2} primaryText='was derived from'/>
                </SelectField>;
        }
        let rmFileBtn = this.props.removeFileFromProvBtn ? 'block' : 'none';
        let showDltRltBtn = this.props.dltRelationsBtn ? 'block' : 'none';
        let versions = null;
        let versionsButton = null;
        let versionCount = [];
        if(this.props.fileVersions && this.props.fileVersions != undefined && this.props.fileVersions.length > 1) {
            versions = this.props.fileVersions.map((version) => {
                return version.is_deleted;
            });
            for (let i = 0; i < versions.length; i++) {
                if(versions[i] === false) {
                    versionCount.push(versions[i]);
                    if(versionCount.length > 1) {
                        versionsButton = <RaisedButton
                            label="CHANGE VERSION"
                            primary={true}
                            labelStyle={styles.provEditor.btn.label}
                            style={styles.provEditor.btn}
                            onTouchTap={() => this.openVersionsModal()}
                            />
                    }
                }
            }
        }
        let width = this.props.screenSize !== null && Object.keys(this.props.screenSize).length !== 0 ? this.props.screenSize.width : window.innerWidth;
        let dialogWidth = width < 680 ? {width: '100%'} : {};
        const dltRelationActions = [
            <FlatButton
                label="Cancel"
                secondary={true}
                onTouchTap={() => this.handleClose('delRel')}/>,
            <FlatButton
                label="Delete"
                secondary={true}
                keyboardFocused={true}
                onTouchTap={() => this.deleteRelation(this.props.selectedEdge)}
                />
        ];
        const relationWarningActions = [
            <FlatButton
                label="Okay"
                secondary={true}
                onTouchTap={() => this.handleClose('relWarning')}/>
        ];
        const nodeWarningActions = [
            <FlatButton
                label="Okay"
                secondary={true}
                onTouchTap={() => this.handleClose('nodeWarning')}/>
        ];
        const derivedRelActions = [
            <FlatButton
                label="Cancel"
                secondary={true}
                onTouchTap={() => this.handleClose('confirmRel')}/>,
            <FlatButton
                label="Switch"
                secondary={true}
                onTouchTap={() => this.switchRelations(this.props.relFrom, this.props.relTo)}/>,
            <FlatButton
                label="Yes"
                secondary={true}
                keyboardFocused={true}
                onTouchTap={() => this.addDerivedFromRelation('was_derived_from', this.props.relFrom, this.props.relTo)}
                />
        ];

        return (
            <div>
                <Drawer disableSwipeToOpen={true} width={width} openSecondary={true} open={this.props.toggleProv}>
                    <Drawer width={220} openSecondary={true} open={this.props.toggleProvEdit}>
                        <div style={styles.provEditor}>
                            <IconButton style={styles.closeEditorIcon}
                                        onTouchTap={() => this.toggleEditor()}>
                                <NavigationClose />
                            </IconButton>
                            {versionsButton}
                            <FileVersionsList {...this.props}/>
                            <ProvenanceFilePicker {...this.props} {...this.state}/>
                            <ProvenanceActivityManager {...this.props} {...this.state}/>
                            <RaisedButton
                                label="Add Relation"
                                labelStyle={{fontWeight: 200}}
                                primary={true}
                                disabled={!!this.state.relationMode}
                                style={styles.btnStyle}
                                onTouchTap={() => this.addRelationMode()}/>
                            {this.state.relationMode ? relationTypeSelect : null}
                            {this.state.relationMode ?
                                <RaisedButton
                                    label="Cancel"
                                    labelStyle={{color: '#f44336'}}
                                    style={styles.btnStyle}
                                    onTouchTap={() => this.toggleEdgeMode()}/>
                                : null}
                            {this.props.addEdgeMode && this.state.relationMode ?
                            <span style={styles.provEditor.expandGraphInstructions}>Instructions
                                <IconButton tooltip={relationInstructions}
                                            tooltipPosition="bottom-center"
                                            iconStyle={styles.infoIcon.iconStyle}
                                            style={styles.infoIcon}>
                                    <Help color={'#BDBDBD'}/>
                                </IconButton>
                            </span> : null}
                            <RaisedButton
                                label="Delete Relation"
                                labelStyle={{fontWeight: 200}}
                                primary={true}
                                style={{zIndex: 9999, margin: 10, width: '80%', display: showDltRltBtn}}
                                onTouchTap={() => this.openModal('dltRel')}/>
                            <span style={styles.provEditor.expandGraphInstructions}>Expand Graph
                                <IconButton tooltip={<span>Double click on a node<br/>to expand and<br/>explore the graph</span>}
                                            tooltipPosition="bottom-center"
                                            iconStyle={styles.infoIcon2.iconStyle}
                                            style={styles.infoIcon2}>
                                    <Help color={'#BDBDBD'}/>
                                </IconButton>
                            </span><br/>
                            {this.props.showProvDetails ? <ProvenanceDetails {...this.state} {...this.props}/> : null}
                        </div>
                        <Dialog
                            style={styles.dialogStyles}
                            contentStyle={dialogWidth}
                            title="This entity is already on the graph, please choose a different one."
                            autoDetectWindowHeight={true}
                            actions={nodeWarningActions}
                            open={nodeWarning}
                            onRequestClose={() => this.handleClose('nodeWarning')}>
                            <i className="material-icons" style={styles.warning}>warning</i>
                        </Dialog>
                        <Dialog
                            style={styles.dialogStyles}
                            contentStyle={dialogWidth}
                            title="Are you sure you want to delete this relation?"
                            autoDetectWindowHeight={true}
                            actions={dltRelationActions}
                            open={dltRel}
                            onRequestClose={() => this.handleClose('dltRel')}>
                            <i className="material-icons" style={styles.warning}>warning</i>
                        </Dialog>
                        <Dialog
                            style={styles.dialogStyles}
                            contentStyle={dialogWidth}
                            title="Can't create relation"
                            autoDetectWindowHeight={true}
                            actions={relationWarningActions}
                            open={openRelWarn}
                            onRequestClose={() => this.handleClose('relWarning')}>
                            <i className="material-icons" style={styles.warning}>warning</i>
                            {drvFrmMsg}
                            {actToActMsg}
                            {notFileToFile}
                            {permissionError}
                            {invalidRelMsg}
                        </Dialog>
                        <Dialog
                            style={styles.dialogStyles}
                            contentStyle={dialogWidth}
                            title="Please confirm that 'was derived from' relation"
                            autoDetectWindowHeight={true}
                            actions={derivedRelActions}
                            open={openConfirmRel}
                            onRequestClose={() => this.handleClose('confirmRel')}>
                            <i className="material-icons" style={styles.derivedRelationDialogIcon}>help</i>
                            <h6>Are you sure that the file <b>{this.props.relFrom && this.props.relFrom !== null ? this.props.relFrom.label+' ' : ''}</b>
                                was derived from the file <b>{this.props.relTo && this.props.relTo !== null ? this.props.relTo.label+' ' : ''}</b>?</h6>
                        </Dialog>
                    </Drawer>
                    <IconButton tooltip="Edit Graph"
                                style={styles.openEditorIcon}
                                onTouchTap={() => this.toggleEditor()}>
                        <BorderColor color="#424242" />
                    </IconButton>
                    <IconButton style={styles.closeEditorIcon}
                                onTouchTap={() => this.toggleProv()}>
                        <NavigationClose />
                    </IconButton>
                    <h6 className="mdl-color-text--grey-800"
                        style={styles.provEditor.title}>
                        <span style={styles.provEditor.title.span1}>{fileName}</span>
                        <span style={styles.provEditor.title.span2}>{'Version '+ fileVersion}</span>
                    </h6>
                    {this.props.drawerLoading ?
                        <CircularProgress size={80} thickness={5} style={styles.graphLoader}/>
                        : null}
                    <div id="graphContainer" ref="graphContainer"
                         className="mdl-cell mdl-cell--12-col mdl-color-text--grey-800"
                         style={{position: 'relative',
                                 marginTop: 50,
                                 maxWidth: width,
                                 height: this.state.height,
                                 float: 'left'}}>
                    </div>
                </Drawer>
            </div>
        );
    }

    addDerivedFromRelation(kind, from, to) {
        ProjectActions.startAddRelation(kind, from, to);
    }

    addRelationMode() {
        if(this.props.showProvCtrlBtns) ProjectActions.showProvControlBtns();//Hide buttons while in add edge mode
        if(this.props.dltRelationsBtn) ProjectActions.showDeleteRelationsBtn([]);
        this.setState({
            relationMode: true
        })
    }

    deleteRelation(edge) {
        let id = this.props.params.id;
        ProjectActions.saveGraphZoomState(this.state.network.getScale(), this.state.network.getViewPosition());
        ProjectActions.deleteProvItem(edge, id);
        ProjectActions.closeProvEditorModal('dltRel');
        ProjectActions.showDeleteRelationsBtn(this.props.selectedEdge, this.props.selectedNode);
    }

    handleClose(id) {
        ProjectActions.closeProvEditorModal(id);
    }

    handleFloatingError(e) {
        if(this.state.floatingErrorText !== '' || !e.target.value) { // Avoid lagging text input due to re-renders
            this.setState({floatingErrorText: e.target.value ? '' : 'This field is required.'});
        }
    }

    handleSelectValueChange(index, event, value) {
        if(window.innerWidth < 680) {
            setTimeout(()=>{this.toggleEditor()}, 2000);
        }
        ProjectActions.toggleAddEdgeMode(value);
        this.state.network.manipulation.addEdgeMode();
        this.setState({
            showDetails: false,
            value: value,
            errorText: null
        });
    }

    openModal(id) {
        ProjectActions.openProvEditorModal(id);
    }

    openVersionsModal() {
        ProjectActions.openModal()
    }

    switchRelations(from, to){
        ProjectActions.switchRelationFromTo(from, to);
    }

    toggleDetails() {
        ProjectActions.toggleProvNodeDetails();
    }

    toggleEdgeMode() {
        this.state.network.manipulation.disableEditMode();
        ProjectActions.toggleAddEdgeMode();
        this.setState({value: null, relationMode: !this.state.relationMode});
    }

    toggleProv() {
        if(this.props.toggleProvEdit && this.props.toggleProv) ProjectActions.toggleProvEditor();
        ProjectActions.toggleProvView();
    }

    toggleEditor() {
        ProjectActions.toggleProvEditor();
    }
}

var styles = {
    btnStyle: {
        margin: 10,
        width: '80%'
    },
    dialogStyles: {
        textAlign: 'center',
        fontColor: '#303F9F',
        zIndex: '5000'
    },
    graphLoader: {
        position: 'absolute',
        margin: '0 auto',
        top: 200,
        left: 0,
        right: 0
    },
    derivedRelationDialogIcon: {
        fontSize: 48,
        textAlign: 'center',
        color: '#235F9C'
    },
    closeEditorIcon: {
        position: 'absolute',
        top: 88,
        left: 10,
        zIndex: 9999
    },
    closeGraphIcon: {
        position: 'absolute',
        top: 88,
        left: 2,
        zIndex: 9999
    },
    infoIcon: {
        verticalAlign: 8,
        zIndex: 9999,
        iconStyle: {
            height: 20,
            width: 20
        }
    },
    infoIcon2: {
        verticalAlign: 8,
        iconStyle: {
            height: 20,
            width: 20
        }
    },
    listBlock: {
        margin: 0
    },
    listGroupTitle: {
        padding: '0px 5px 0px 5px',
        height: 24,
        lineHeight: '175%'
    },
    listHeader: {
        margin: '20px 0px 5px 0px'
    },
    listItem: {
        padding: '0px 5px 0px 5px'
    },
    openEditorIcon: {
        position: 'absolute',
        top: 90,
        right: 10,
        zIndex: 200
    },
    provEditor:{
        display: 'flex',
        justifyContent: 'center',
        flexFlow: 'row wrap',
        marginTop: 140,
        padding: 5,
        details: {
            width: '100%',
            margin: 0,
            color:'#757575'
        },
        addEdgeInstruction: {
            maxWidth:'168px',
            margin: '5px 15px 5px 15px',
            padding: 8,
            backgroundColor: '#66BB6A',
            color: '#FFF'
        },
        btn: {
            zIndex: 9999,
            margin: 10,
            width: '80%',
            label: {
                fontWeight: 200
            }
        },
        expandGraphInstructions: {
            width: 170,
            fontSize: 16,
            color: '#757575'
        },
        title: {
            margin: '112px 0px 0px 54px',
            fontWeight: 100,
            textAlign: 'center',
            span1: {
                marginRight: 50
            },
            span2: {
                display: 'block',
                marginRight: 50
            }
        }
    },
    relationInstructions: {
        fontWeight: 600,
        textDecoration: 'underline'
    },
    selectStyles: {
        margin: '-15px 20px 0px 20px',
        maxWidth: '90%',
        minWidth: 160,
        textAlign: 'left',
        color: '#757575',
        floatingLabel: {
            color: '#235F9C'
        },
        icon: {
            right: -10
        },
        label: {
            paddingRight: 0,
            color: '#235F9C'
        }
    },
    textStyles: {
        textAlign: 'left',
        fontColor: '#303F9F'
    },
    warning: {
        fontSize: 48,
        textAlign: 'center',
        color: '#F44336'
    }
};

export default Provenance;