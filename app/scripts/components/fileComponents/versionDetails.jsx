import React, { PropTypes } from 'react';
const { object, bool, array, string } = PropTypes;
import ProjectActions from '../../actions/projectActions';
import ProjectStore from '../../stores/projectStore';
import VersionOptionsMenu from './versionOptionsMenu.jsx';
import Loaders from '../../components/globalComponents/loaders.jsx';
import {UrlGen, Path} from '../../../util/urlEnum';
import Tooltip from '../../../util/tooltip.js';
import BaseUtils from '../../../util/baseUtils.js';
import Card from 'material-ui/Card';

class VersionDetails extends React.Component {

    render() {
        let prjPrm = this.props.projPermissions && this.props.projPermissions !== undefined ? this.props.projPermissions : null;
        let dlButton = null;
        let optionsMenu = null;
        if (prjPrm !== null) {
            dlButton = prjPrm === 'viewOnly' || prjPrm === 'flUpload' ? null :
                <button
                    title="Download File"
                    style={styles.downloadBtn}
                    rel="tooltip"
                    className="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--mini-fab mdl-button--colored"
                    onTouchTap={() => this.handleDownload()}>
                    <i className="material-icons">get_app</i>
                </button>;
            optionsMenu = <VersionOptionsMenu {...this.props}/>;
        }
        let loading = this.props.loading ?
            <div className="mdl-progress mdl-js-progress mdl-progress__indeterminate"></div> : '';
        let id = this.props.params.id;
        let parentId = this.props.entityObj && this.props.entityObj.file ? this.props.entityObj.file.id : null;
        let name = this.props.entityObj && this.props.entityObj.file ? this.props.entityObj.file.name : null;
        let label = this.props.entityObj && this.props.entityObj.label ? this.props.entityObj.label : null;
        let projectName = this.props.entityObj && this.props.entityObj.ancestors ? this.props.entityObj.ancestors[0].name : null;
        let crdOn = this.props.entityObj && this.props.entityObj.audit ? this.props.entityObj.audit.created_on : null;
        let createdBy = this.props.entityObj && this.props.entityObj.audit ? this.props.entityObj.audit.created_by.full_name : null;
        let lastUpdatedOn = this.props.entityObj && this.props.entityObj.audit ? this.props.entityObj.audit.last_updated_on : null;
        let lastUpdatedBy = this.props.entityObj && this.props.entityObj.audit.last_updated_by ? this.props.entityObj.audit.last_updated_by.full_name : null;
        let storage =  this.props.entityObj && this.props.entityObj.upload ? this.props.entityObj.upload.storage_provider.description : null;
        let bytes = this.props.entityObj && this.props.entityObj.upload ? this.props.entityObj.upload.size : null;
        let hash = this.props.entityObj && this.props.entityObj.upload.hashes.length ? this.props.entityObj.upload.hashes[0].algorithm +': '+ this.props.entityObj.upload.hashes[0].value : null;
        let versNumber = this.props.entityObj ? this.props.entityObj.version : null;
        Tooltip.bindEvents();

        let version = <Card className="project-container mdl-color--white content mdl-color-text--grey-800"
                            style={styles.card}>
            <div className="mdl-cell mdl-cell--12-col" style={{position: 'relative'}}>
                { dlButton }
            </div>
            <div id="tooltip"></div>
            <div className="mdl-cell mdl-cell--12-col mdl-color-text--grey-800">
                <div style={styles.menuIcon}>
                    { optionsMenu }
                </div>
                <div className="mdl-cell mdl-cell--12-col mdl-color-text--grey-800" style={styles.arrow}>
                    <a href={UrlGen.routes.file(parentId)} style={styles.back}
                       className="mdl-color-text--grey-800 external">
                        <i className="material-icons"
                           style={styles.backIcon}>keyboard_backspace</i>Back</a>
                </div>
                <div className="mdl-cell mdl-cell--9-col mdl-cell--8-col-tablet mdl-cell--4-col-phone" style={styles.detailsTitle}>
                    <span className="mdl-color-text--grey-800" style={styles.title}>{ name }</span>
                </div>
                { label != null ? <div className="mdl-cell mdl-cell--12-col mdl-cell--8-col-tablet mdl-cell--4-col-phone" style={styles.subTitle}>
                    <span className="mdl-color-text--grey-600" style={styles.spanTitle}>{ label }</span>
                </div> : null }
                <div className="mdl-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-color-text--grey-600" style={styles.subTitle}>
                    <span style={styles.spanTitle}>{ 'Version: ' + versNumber }</span>
                </div>
                <div className="mdl-cell mdl-cell--12-col content-block"  style={styles.list}>
                    <div className="list-block">
                        <div className="list-group">
                            <ul>
                                <li className="list-group-title">Created By</li>
                                <li className="item-content">
                                    <div className="item-inner">
                                        <div>{ createdBy }</div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="list-group">
                            <ul>
                                <li className="list-group-title">Created On</li>
                                <li className="item-content">
                                    <div className="item-inner">
                                        <div>{ BaseUtils.formatDate(crdOn) }</div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="list-group">
                            <ul>
                                <li className="list-group-title">Size</li>
                                <li className="item-content">
                                    <div className="item-inner">
                                        <div>{ bytes !== null ? BaseUtils.bytesToSize(bytes) : '' }</div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="list-group">
                            <ul>
                                <li className="list-group-title">Version ID</li>
                                <li className="item-content">
                                    <div className="item-inner">
                                        <div>{ id }</div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="list-group">
                            <ul>
                                <li className="list-group-title">Hash</li>
                                <li className="item-content">
                                    <div className="item-inner">
                                        <div>{ hash }</div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="list-group">
                            <ul>
                                <li className="list-group-title">Last Updated By</li>
                                <li className="item-content">
                                    <div className="item-inner">
                                        <div>{ lastUpdatedBy === null ? 'N/A' : lastUpdatedBy}</div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="list-group">
                            <ul>
                                <li className="list-group-title">Last Updated On</li>
                                <li className="item-content">
                                    <div className="item-inner">
                                        <div>{ lastUpdatedOn === null ? 'N/A' : BaseUtils.formatDate(lastUpdatedOn)}</div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="list-group">
                            <ul>
                                <li className="list-group-title">Storage Location</li>
                                <li className="item-content">
                                    <div className="item-inner">
                                        <div>{ storage }</div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </Card>;
        return (
            <div>
                { version }
                <Loaders {...this.props}/>
            </div>
        )
    }

    handleDownload(){
        let id = this.props.params.id;
        let kind = Path.FILE;
        ProjectActions.getDownloadUrl(id, kind);
    }
}

var styles = {
    arrow: {
        textAlign: 'left',
        marginTop: -5
    },
    back: {
        verticalAlign:-7
    },
    backIcon: {
        fontSize: 24,
        verticalAlign:-7
    },
    btnWrapper: {
        marginTop: 11,
        marginRight: 25,
        float: 'right'
    },
    button: {
        float: 'right'
    },
    card: {
        paddingBottom: 30,
        overflow: 'visible',
        padding: '10px 0px 10px 0px'
    },
    detailsTitle: {
        textAlign: 'left',
        float: 'left',
        marginLeft: 26
    },
    downloadBtn: {
        position: 'absolute',
        top: -33,
        right: '1.4%',
        zIndex: '2',
        color: '#ffffff'
    },
    list: {
        paddingTop: 5,
        clear: 'both'
    },
    menuIcon: {
        float: 'right',
        marginTop: 30,
        marginBottom: -3,
        marginRight: 10
    },
    spanTitle: {
        fontSize: '1.2em'
    },
    subTitle: {
        textAlign: 'left',
        float: 'left',
        marginLeft: 25,
        marginTop: 18
    },
    title: {
        fontSize: 24,
        wordWrap: 'break-word'
    }
};

VersionDetails.contextTypes = {
    muiTheme: React.PropTypes.object
};

VersionDetails.propTypes = {
    loading: bool,
    details: array,
    error: object
};

export default VersionDetails;