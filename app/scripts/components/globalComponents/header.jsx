import React from 'react';
import ProjectStore from '../../stores/projectStore';
import MainActions from '../../actions/mainActions';
import ProjectActions from '../../actions/projectActions';
import CurrentUser from '../globalComponents/currentUser.jsx';
import Search from '../globalComponents/search.jsx';
import FontIcon from 'material-ui/FontIcon';

class Header extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showSearch: ProjectStore.showSearch,
            includeKinds: ProjectStore.includeKinds,
            includeProjects: ProjectStore.includeProjects
        };
    }

    componentDidMount() {
        this.unsubscribe = ProjectStore.listen(state => this.setState(state));
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    render() {
        let header = <div className="navbar" style={styles.navBar}>
            <div className="navbar-inner" style={{display: this.state.showSearch ? 'none' : '', height: 106}}>
                <div className="left" style={styles.navBar.leftDiv}>
                    {!this.props.appConfig.apiToken ? '' : <a href="#" className="open-panel"><FontIcon className="material-icons" style={styles.openIcon}>menu</FontIcon></a>}
                    {!this.props.appConfig.apiToken ? '' : <img src="images/dukeDSVertical.png" style={styles.logo}/>}
                </div>
                <div className="center" style={styles.navBar.centerDiv}></div>
                <div className="right">
                    {/*<FontIcon className="material-icons" style={styles.searchIcon}
                     onTouchTap={()=>this.showSearch()}>search</FontIcon>*/}
                    <CurrentUser {...this.props} {...this.state}/>
                </div>
            </div>
            {/*this.state.showSearch ? <Search {...this.props} {...this.state}/> : null*/}
        </div>;

        if(!this.props.appConfig.apiToken) {
            return null;
        } else {
            return header
        }
    }

    showSearch() {
        ProjectActions.toggleSearch();
    }
}

var styles = {
    icon: {
        color: "#fff",
        fontSize: 24,
        position: 'absolute',
        bottom: 3,
        right: 10
    },
    logo: {
        width: '20%',
        maxWidth: '20%',
        minWidth: 58,
        minHeight: 46,
        marginLeft: 50
    },
    navBar: {
        height: 76,
        centerDiv: {
            width: '100%'
        },
        leftDiv: {
            maxWidth: 130,
            marginBottom: 35
        }
    },
    openIcon: {
        fontSize: 24,
        color: '#fff',
        position: 'absolute',
        left: 10,
        bottom: 9
    },
    searchIcon: {
        color: "#fff",
        position: 'absolute',
        bottom: 3,
        right: 50,
        cursor: 'pointer'
    },
    userOptions: {
        cursor:'pointer',
        color:'#FFF',
        position: 'absolute',
        right: 0,
        width: 200
    }
};

export default Header;