import React, { Component } from 'react';
import './App.css';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import queryString from 'query-string';
import 'typeface-roboto';

let textColor = 'darkgoldenrod'
let defaultStyle = {
  color: textColor,
}

let fakeServerData = {
  user: {
    name: 'Raymond',
    playlists: [
      {
        name: 'My Favorites',
        songs: [
          {name: 'In My Feelings', duration: 1245}, 
          {name:'Best I Ever Had', duration: 3183}, 
          {name: 'Hotline Bling', duration: 3880}
        ] 
      }
    ]
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
       <img/>
       <h3>{playlist.name}</h3>
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
  constructor(){
    super();
    this.state = {serverData: {},
    filterString: ''
    }
  }
  componentDidMount(){
    const parsed = queryString.parse(window.location.search);
    let accessToken = parsed.access_token;

    //Fetches access token for the api
    fetch('https://api.spotify.com/v1/me', {
      headers: {'Authorization': 'Bearer ' + accessToken}
    }).then(response => response.json())
    .then(data => this.setState({serverData: {user: {name: data.id}}}))
    
    //Fetches playlists of the current user
    fetch('https://api.spotify.com/v1/me/playlists', {
      headers: {'Authorization': 'Bearer ' + accessToken}
    }).then(response => response.json())
    .then(data => this.setState({
        playlists: data.items.map(item => ({
          name: item.name,
          songs: []
      }))
    }))
    
  }
  render() {
    let playlistToRender = 
    this.state.serverData.user && 
    this.state.playlists 
      ? this.state.playlists.filter(playlist =>
        playlist.name.toLowerCase().includes(
          this.state.filterString.toLowerCase())) 
      : []

    

    return (
      <div className="App">
        <Typography variant='display1' align='center' gutterBottom>
          The Cookout
        </Typography>
          {this.state.serverData.user ?
        <div> 
          <h3 style={{color: textColor}}>
          {this.state.serverData.user.name}'s Playlists
          </h3>
          <PlaylistCounter playlists={playlistToRender}/>
          {/*<DurationCounter playlists={playlistToRender}/>*/}
          <Filter onTextChange={text => {             
             console.log(text);
             this.setState({filterString: text})
            }}/>
              {playlistToRender.map(playlist =>
          <Playlist playlist={playlist}/>
            )}
        </div> : <Button onClick={()=> window.location= 'http://localhost:8888/login'}
        variant="raised" color= 'primary'>
        Sign in with Spotify
        </Button>
        }
      </div>
    );
  }
}

export default App;
      
