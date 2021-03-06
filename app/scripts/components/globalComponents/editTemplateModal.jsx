import React, { PropTypes } from 'react';
const { object, bool, array, string } = PropTypes;
import ProjectActions from '../../actions/projectActions';
import ProjectStore from '../../stores/projectStore';
import BaseUtils from '../../../util/baseUtils'
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

class EditTemplateModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            errorText: ''
        };
    }

    render() {
        let open = this.props.toggleModal && this.props.toggleModal.id === 'editTemplate' ? this.props.toggleModal.open : false;
        let templateDesc = this.props.metadataTemplate && this.props.metadataTemplate !== null ? this.props.metadataTemplate.description : null;
        let templateId = this.props.metadataTemplate && this.props.metadataTemplate !== null ? this.props.metadataTemplate.id : null;
        let templateLabel = this.props.metadataTemplate && this.props.metadataTemplate !== null ? this.props.metadataTemplate.label : null;
        let templateName = this.props.metadataTemplate && this.props.metadataTemplate !== null ? this.props.metadataTemplate.name : null;
        const editActions = [
            <FlatButton
                label="CANCEL"
                secondary={true}
                onTouchTap={() => this.handleClose()} />,
            <FlatButton
                label="UPDATE"
                secondary={true}
                keyboardFocused={true}
                onTouchTap={() => this.editTemplate(templateId)} />
        ];
        return (
            <Dialog
                style={styles.dialogStyles}
                contentStyle={this.props.screenSize.width < 580 ? {width: '100%'} : {}}
                title="Edit Template"
                autoDetectWindowHeight={true}
                actions={editActions}
                onRequestClose={() => this.handleClose()}
                open={open}>
                <TextField
                    fullWidth={true}
                    ref={(input) => this.templateName = input}
                    disabled={true}
                    underlineDisabledStyle={{display: 'none'}}
                    inputStyle={{color: '#212121'}}
                    defaultValue={templateName}
                    floatingLabelText="Name"/><br/>
                <TextField
                    fullWidth={true}
                    ref={(input) => this.templateLabel = input}
                    autoFocus={true}
                    onFocus={() => this.selectText()}
                    defaultValue={templateLabel}
                    hintText="A readable label for your template"
                    errorText={this.state.errorText}
                    floatingLabelText="Display Label"
                    onChange={(e) => this.validateText(e)}/><br/>
                <TextField
                    fullWidth={true}
                    ref={(input) => this.templateDesc = input}
                    style={{textAlign: 'left'}}
                    defaultValue={templateDesc}
                    hintText="Verbose template description"
                    floatingLabelText="Description"
                    multiLine={true}
                    rows={3}/>
            </Dialog>
        )
    }

    editTemplate(id) {
        let name = this.templateName.getValue();
        let label = this.templateLabel.getValue();
        let desc = this.templateDesc.getValue();
        if(!BaseUtils.validateTemplateName(name)) {
            this.setState({
                errorText: 'Invalid characters or spaces. Name must only consist of alphanumerics and underscores.'
            });
        } else {
            if (name !== '' && label !== '') {
                ProjectActions. updateMetadataTemplate(id, name, label, desc);
                ProjectActions.toggleModals();
            }
        }
    }

    handleClose() {
        ProjectActions.toggleModals();
        this.setState({
            errorText: '',
            errorText2: ''
        });
    }

    selectText() {
        setTimeout(()=>this.templateLabel.select(),100);
    }

    validateText(e) {
        this.setState({
            errorText: e.target.value ? '' : 'This field is required'
        });
    }
}

var styles = {
    dialogStyles: {
        textAlign: 'center',
        fontColor: '#303F9F',
        zIndex: '5000'
    }
};

EditTemplateModal.contextTypes = {
    muiTheme: React.PropTypes.object
};

EditTemplateModal.propTypes = {
    loading: bool,
    error: object
};

export default EditTemplateModal;