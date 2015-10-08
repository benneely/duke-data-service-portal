import React from 'react'
import ProjectListActions from '../actions/projectListActions';
import ProjectStore from '../stores/projectStore';
import FileDetails from '../components/fileComponents/fileDetails.jsx';
import FilePreview from '../components/fileComponents/filePreview.jsx';
import FileProvenance from '../components/fileComponents/fileProvenance.jsx';
import Header from '../components/globalComponents/header.jsx';

class File extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    componentDidMount() {
        this.unsubscribe = ProjectStore.listen(state => this.setState(state));
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    render() {

        return (
            <div>
                <FileDetails {...this.props} {...this.state} />
                <FilePreview {...this.props} {...this.state} />
                <FileProvenance {...this.props} {...this.state} />
            </div>
        );
    }
}

export default File;