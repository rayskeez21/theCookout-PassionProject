import AlbumList from "./AlbumList";
import { connect } from "react-redux";
import uniqBy from 'lodash/uniqBy';

const mapStateToProps = (state) => {

  const albumSongs = state.songsReducer.songs ? uniqBy(state.songsReducer.songs, (item) => {
    return item.track.album.name;
  }) : '';

  return {
    songs: albumSongs
  };

};

export default connect(mapStateToProps)(AlbumList);