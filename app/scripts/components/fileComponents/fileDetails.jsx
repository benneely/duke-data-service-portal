import React from 'react';
import { Link } from 'react-router';
import cookie from 'react-cookie';
import FilePreview from './filePreview.jsx';

var mui = require('material-ui'),
    TextField = mui.TextField,
    IconMenu = mui.IconMenu,
    Dialog = mui.Dialog;


class FileDetails extends React.Component {

    constructor() {
        this.state = {

        }
    }

    render() {
        let error = '';
        let loading = this.props.loading ?
            <div className="mdl-progress mdl-js-progress mdl-progress__indeterminate"></div> : '';

        return (
        <div>
            <div className="project-container mdl-color--white mdl-shadow--2dp content mdl-color-text--grey-800" style={styles.container}>
                <button className="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--mini-fab mdl-button--colored"
                        style={styles.floatingButton}
                        >
                    <i className="material-icons">get_app</i>
                </button>
                <div className="mdl-cell mdl-cell--12-col mdl-color-text--grey-800">
                    <div className="mdl-cell mdl-cell--12-col mdl-color-text--grey-800" style={styles.arrow}>
                        <Link to={'/folder/' + this.props.params.id} style={styles.back}><i className="material-icons" style={styles.backIcon}>keyboard_backspace</i>Back</Link>
                    </div>
                    <div className="mdl-cell mdl-cell--12-col" style={styles.detailsTitle}>
                        <span className="mdl-color-text--grey-800" style={styles.breadcrumbs}>Test Project 123
                            <i className="material-icons mdl-color-text--grey-600" style={styles.moreIcon}>keyboard_arrow_right</i>
                            <span className="mdl-color-text--grey-600"style={styles.folderName}><a href="#">KOMP Data</a></span><i className="material-icons mdl-color-text--grey-600" style={styles.moreIcon}>keyboard_arrow_right</i>
                            <span className="mdl-color-text--grey-600"style={styles.folderName}>KOMP Data</span>
                        </span>
                    </div>
                    <div className="mdl-cell mdl-cell--12-col mdl-color-text--grey-800" style={styles.details}>
                        <div className="mdl-cell mdl-cell--3-col mdl-cell--8-col-tablet" style={styles.details}>
                            <span style={styles.spanTitle}><i className="material-icons mdl-color-text--grey-600" style={styles.fileIcon}>description</i></span>
                        </div>
                        <div className="mdl-cell mdl-cell--3-col mdl-cell--8-col-tablet" style={styles.details}>
                            <span style={styles.span}>Created By:</span>
                        </div>
                        <div className="mdl-cell mdl-cell--3-col mdl-cell--8-col-tablet" style={styles.details}>
                            <span style={styles.span}>Created On:</span>
                        </div>
                        <div className="mdl-cell mdl-cell--3-col mdl-cell--8-col-tablet" style={styles.details}>
                            <span style={styles.span}>ID:</span>
                        </div>
                    </div>
                    <div className="mdl-cell mdl-cell--12-col mdl-color-text--grey-800" style={styles.details}>
                        <div className="mdl-cell mdl-cell--4-col mdl-cell--8-col-tablet" style={styles.details}>
                            <span style={styles.span}>File Size:</span>
                        </div>
                        <div className="mdl-cell mdl-cell--4-col mdl-cell--8-col-tablet" style={styles.details}>
                            <span style={styles.span}>Storage:</span>
                        </div>
                        <div className="mdl-cell mdl-cell--4-col mdl-cell--8-col-tablet" style={styles.details}>
                            <span style={styles.span}>SHA-1:</span>
                        </div>
                    </div>
                    <div className="mdl-cell mdl-cell--12-col mdl-color-text--grey-800" style={styles.detailsButton}>
                        <button className="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--colored"
                                onClick={this.handleTouchTapDetails.bind(this)}>
                            {!this.state.showDetails ? 'MORE DETAILS' : 'LESS DETAILS'}
                        </button>
                    </div>
                    <div className="mdl-cell mdl-cell--12-col mdl-color-text--grey-800">
                        <div style={styles.moreDetails} className={!this.state.showDetails ? 'less' : 'more'}>
                            { this.state.showDetails ? <Details className={this.state.newClass}/> : null }
                        </div>
                    </div>
                </div>
                { loading }
                { error }
            </div>
                <FilePreview />
            <button className="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--colored" style={styles.fullView}>
                FULL VIEW
            </button>
            <div className="project-container mdl-color--white mdl-shadow--2dp content mdl-color-text--grey-800" style={styles.container}>
            </div>
        </div>
);
    }

    handleTouchTapDetails() {
        if (!this.state.showDetails) {
            this.setState({showDetails: true})
        } else {
            this.setState({showDetails: false})
        }
    }
}


var styles = {
    container: {
        marginTop: 24,
        position: 'relative',
        overflow: 'visible',
        padding: '10px 0px 10px 0px'
    },
    details: {
        textAlign: 'left',
        float: 'left',
        marginLeft: 8
    },
    summary: {
        float: 'left',
        textAlign: 'left'
    },
    detailsButton: {
        align: 'center',
        clear: 'both'
    },
    textStyles: {
        textAlign: 'left'
    },
    span: {
        fontWeight: 'bold'
    },
    spanTitle: {
        fontWeight: 'bold',
        fontSize: '1.5em'
    },
    moreDetails: {
        textAlign: 'left'
    },
    fileIcon: {
        fontSize: 36
    },
    backIcon: {
        fontSize: 24,
        float: 'left'
    },
    arrow: {
        textAlign: 'left'
    },
    back: {
        verticalAlign: -2
    },
    detailsTitle: {
        textAlign: 'left',
        float: 'left'
    },
    breadcrumbs: {
        fontSize: 24
    },
    folderName: {
        fontSize: 14
    },
    moreIcon: {
        fontSize: 36,
        verticalAlign: -11
    },
    floatingButton: {
        position: 'absolute',
        top: -20,
        right: '2%',
        zIndex: '2',
        color: '#ffffff'
    },
    fullView: {
        float: 'right'
    }
};

FileDetails.contextTypes = {
    muiTheme: React.PropTypes.object
};

FileDetails.propTypes = {
    loading: React.PropTypes.bool,
    details: React.PropTypes.array,
    error: React.PropTypes.string
};


export default FileDetails;

