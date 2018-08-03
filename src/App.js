import React, { Component } from 'react';
import './App.css';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import queryString from 'qs';
import BurgerMenu from 'react-burger-menu';
import { slide as Menu } from 'react-burger-menu';




let textColor = 'grey'
let defaultStyle = {
  color: textColor,
}

let styles = {
  bmBurgerButton: {
    position: 'fixed',
    width: '36px',
    height: '30px',
    left: '36px',
    top: '36px'
  },
  bmBurgerBars: {
    background: '#373a47'
  },
  bmCrossButton: {
    height: '24px',
    width: '24px'
  },
  bmCross: {
    background: '#bdc3c7'
  },
  bmMenu: {
    background: '#373a47',
    padding: '2.5em 1.5em 0',
    fontSize: '1.15em'
  },
  bmMorphShape: {
    fill: '#373a47'
  },
  bmItemList: {
    color: '#b8b7ad',
    padding: '0.8em'
  },
  bmItem:{
    display: 'block',
    fontSize: '30px',
    padding: '10px'
  },
  bmOverlay: {
    background: 'rgba(0, 0, 0, 0.3)'
  }
}

class MenuWrap extends Component{
  constructor(props){
    super(props);
    this.state= {
      hidden: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const sideChanged = this.props.children.props.right !== nextProps.children.props.right;

    if(sideChanged) {
      this.setState({hidden: true});

      setTimeout(() =>{
        this.show();
      }, this.props.wait);
    }
  }

  show(){
    this.setState({hidden: false});
  }
  render() {
    let style;

    if(this.state.hidden) {
      style = {display: 'none'};
    }

    return(
      <div style={style} className={this.props.side}>
      {this.props.children}
      </div>
    );
  }
}


class PlaylistCounter extends Component{
  render() {
    return (
      <div style= {{width: "40%", display: 'inline-block'}}>
      <h2>{this.props.playlists.length} Playlists</h2>
      </div>
    );
  }
}

class DurationCounter extends Component{
  render() {
    let allSongs =this.props.playlists.reduce((songs, eachPlaylist) => {
      return songs.concat(eachPlaylist.songs)
    }, [])
   let totalDuration = allSongs.reduce((sum, eachSong) => {
     return sum + eachSong.duration
   },0) 

    return (
      <div style= {{width: "40%", display: 'inline-block'}}>
      <h2> Total time: {Math.round(totalDuration/60) }</h2>
      </div>
    );
  }
}

class Filter extends Component{
  render() {
    return (
      <div style={defaultStyle}>
      <img/>
      <input type="text" onKeyDown={event => 
        this.props.onTextChange(event.target.value)}/>
      <img/>
      </div>
    );
  }
}

class Playlist extends Component{
  render() {
    let playlist = this.props.playlist;
    return(
      <div style={{...defaultStyle, width: "25%", display: 'inline-block'}}>
       <img src= {playlist.imageUrl} style = {{width: '160px'}}/>
       <Typography variant='Headline' align='center' gutterBottom>
       <h3>{playlist.name}</h3>
       </Typography>
       <ul>
       {playlist.songs.map(song => 
        <li>{song.name}</li>
      )}
       </ul>
       </div>
    );
  }
}


class App extends Component {
  constructor(props){
    super(props);
    this.state = {serverData: {},
    filterString: '',
    currentMenu: 'slide',
    menuOpen: false,
    side: 'left'
    }
   }

   handleStateChange(state){
     this.setState({menuOpen: state.isOpen})
   }

   closeMenu(){
     this.setState({menuOpen: false})
   }

   toggleMenu(){
     this.setState({menuOpen: !this.state.menuOpen})
   }

   getItems(){
    let items = [
          <a key="0" href="/"><i className="menu-item" /><span>Home</span></a>,
          <a key="1" href=""><i className="menu-item" /><span>Playlists</span></a>,
          <a key="2" href=""><i className="menu-item" /><span>Search</span></a>,
          <a key="3" href=""><i className="menu-item" /><span>Friends</span></a>
        ]
      return items;
      }
    

  componentDidMount(){
     let parsed = queryString.parse(window.location.search);
     console.log(parsed);
     console.log(parsed["?access_token"])
     let accessToken = parsed["?access_token"];
     
     //Checks to see if access token is still valid. Prompts sign in button if not. 
     if(!accessToken)
      return; 

    //Fetches access token for the api
    fetch('https://api.spotify.com/v1/me', {
       headers: {'Authorization': 'Bearer ' + accessToken}
     }).then(response => response.json())
     .then(data => this.setState({
       user: {
         name: data.id
       }
      }))
    
    //Fetches playlists of the current user
    fetch('https://api.spotify.com/v1/me/playlists', {
      headers: {'Authorization': 'Bearer ' + accessToken}
    }).then(response => response.json())
    .then(playlistData => {
      let playlists = playlistData.items
      let trackDataPromises = playlists.map(playlist => {
        let responsePromise = fetch(playlist.tracks.href, {
          headers: {'Authorization': 'Bearer ' + accessToken}
        })
        let trackDataPromise = responsePromise
          .then(response => response.json())
        return trackDataPromise
      })
      let allTracksDataPromises = 
        Promise.all(trackDataPromises)
      let playlistsPromise = allTracksDataPromises.then(trackDatas => {
        trackDatas.forEach((trackData, i) => {
          playlists[i].trackDatas = trackData.items
            .map(item => item.track)
            .map(trackData => ({
              name: trackData.name,
              duration: trackData.duration_ms / 1000
            }))
        })
        return playlists
      })
      return playlistsPromise
    })
    .then(playlists => this.setState({
      playlists: playlists.map(item => {
        return {
          name: item.name,
          imageUrl: item.images[0].url, 
          songs: item.trackDatas.slice(0,3)
        }
    })
    }))

  }
          
  render() {
    let playlistToRender = 
    this.state.user && 
    this.state.playlists 
      ? this.state.playlists.filter(playlist =>{
        let matchesPlaylist = playlist.name.toLowerCase().includes(
          this.state.filterString.toLowerCase())
          let matchesSong = playlist.songs.find(song => song.name.toLowerCase()
          .includes(this.state.filterString.toLowerCase()))
          return matchesPlaylist || matchesSong
        }) : []

        const items = this.getItems();
        const Menu = BurgerMenu[this.state.currentMenu];

        
        
        return (
          <div id="outer-container" style={{height: '100%'}}>
            <main id="page-wrap">
              <div className="App">
              <MenuWrap wait={20}>
                 <Menu styles={styles} id={this.state.currentMenu} pageWrapId={'page-wrap'} outerContainerId={'outer-container'}>
                  {items}
                 </Menu>
              </MenuWrap>
                <Typography variant='display1' align='center' gutterBottom>
                  The Cookout
                </Typography>
                  {this.state.user ?
                <div> 
                  <Typography variant='Title' >
                  <h3 style={{color: textColor}}>
                  {this.state.user.name}'s Playlists
                  </h3>
                  </Typography>
                  <PlaylistCounter playlists={playlistToRender}/>
                  <DurationCounter playlists={playlistToRender}/>
                  <Filter onTextChange={text => {             
                    console.log(text);
                    this.setState({filterString: text})
                      }}/>
                      
                    {playlistToRender.map(playlist =>
                  <Playlist playlist={playlist}/>
                    )}
                    
                </div> : <Button onClick={()=> {
                  window.location = window.location.href.includes('localhost') 
                  ? 'http://localhost:8888/login' 
                  : 'https://backendcookout.herokuapp.com/login'}
                }
                variant="raised" color= 'primary'>
                Sign in with Spotify
                </Button>
                }
                </div>
               </main>
             </div>
        );
      }
    }

    
    export default App;
      
         
        
       
          

    

