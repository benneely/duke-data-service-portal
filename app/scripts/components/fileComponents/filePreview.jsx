import React from 'react';
import { Link } from 'react-router';
import cookie from 'react-cookie';

var mui = require('material-ui'),
    TextField = mui.TextField,
    IconMenu = mui.IconMenu,
    Dialog = mui.Dialog;


class FilePreview extends React.Component {

    constructor() {
        this.state = {

        }
    }

    render() {
        let error = '';
        let loading = this.props.loading ?
            <div className="mdl-progress mdl-js-progress mdl-progress__indeterminate"></div> : '';

        return (
            <div className="project-container mdl-grid" style={styles.container}>
                <div className="mdl-cell mdl-cell--12-col mdl-color-text--grey-800" style={styles.listTitle}>
                    <div style={styles.listTitle}>
                        <h4>Preview</h4>
                    </div>
                    <button className="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--colored" style={styles.fullView}>
                        FULL VIEW
                    </button>
                </div>
                <div className="mdl-cell mdl-cell--12-col mdl-shadow--2dp mdl-color-text--grey-800" style={styles.container2}>
                    <img src="http://link.springer.com/article/10.1007%2FBF02710080/lookinside/000.png" style={styles.image}/>
                </div>
            </div>
        );
    }
}



var styles = {
    container: {
        //overflow: 'hidden',
        //height: 'auto'
    },
    container2: {
        overflow: 'hidden',
        height: 250
    },
    fullView: {
        float: 'right',
        position: 'relative',
        margin: '18px -10px 0px 0px'
    },
    image: {
        maxWidth: '50%',
        maxHeight: '100%'
    },
    listTitle: {
        margin: '0px 0px -5px 0px',
        textAlign: 'left',
        float: 'left',
        paddingLeft: 5
    }
};

FilePreview.contextTypes = {
    muiTheme: React.PropTypes.object
};

FilePreview.propTypes = {
    loading: React.PropTypes.bool,
    details: React.PropTypes.array,
    error: React.PropTypes.string
};


export default FilePreview;
