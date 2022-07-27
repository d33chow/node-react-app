import React from 'react';
import Link from '@material-ui/core/Link';
import history from '../Navigation/history';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { MuiThemeProvider, createTheme, ThemeProvider, styled } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import SearchIcon from '@material-ui/icons/Search';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import Paper from "@material-ui/core/Paper";

const serverURL = "";

const fetch = require("node-fetch");

const opacityValue = 1;

const lightTheme = createTheme({
  palette: {
    type: 'light',
    background: {
      default: "#ccddff"
    },
    primary: {
      main: '#9a9aef',
      light: '#ccccff',
      dark: '#6b6bba',
      background: '#eeeeee'
    },
    secondary: {
      main: "#1c1cb7",
      light: '#4555f0',
      dark: '#00007f'
    },
  },
});

const MainGridContainer = styled(Grid)(({ theme }) => ({
  marginLeft: theme.spacing(4),
}))

const MoviePaper = styled(Paper)(({ theme }) => ({
  opacity: 0.7,
  backgroundColor: theme.palette.primary.background,
  padding: 8,
  borderRadius: 4,
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2)
}));

const Search = () => {

  const toLanding = () => {
    history.push('/')
  }

  const toReviews = () => {
    history.push('/reviews')
  }

  const toMyPage = () => {
    history.push('/actors')
  }

  const [directorSearchTerm, setDirectorSearchTerm] = React.useState('');
  const [actorSearchTerm, setActorSearchTerm] = React.useState('');
  const [titleSearchTerm, setTitleSearchTerm] = React.useState('');

  const [moviesList, setMoviesList] = React.useState([]);

  const handleMoviesSearch = () => {
    callApiFindMovies()
      .then(res => {
        console.log("callApiFindMovies returned: ", res)
        var parsed = JSON.parse(res.express);
        console.log("callApiFindMovies parsed: ", parsed[0])
        setMoviesList(parsed);
      });
  }

  const callApiFindMovies = async () => {

    const url = serverURL + "/api/findMovies";
    console.log(url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        directorSearchTerm: "%" + directorSearchTerm + "%",
        actorSearchTerm: "%" + actorSearchTerm + "%",
        titleSearchTerm: "%" + titleSearchTerm + "%"
      })
    });
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    console.log("Found Movies: ", body);
    return body;
  }

  const onChangeTitle = (event) => {
    setTitleSearchTerm(event.target.value);
  }

  const onChangeDirector = (event) => {
    setDirectorSearchTerm(event.target.value);
  }

  const onChangeActor = (event) => {
    setActorSearchTerm(event.target.value);
  }

  return (
    <ThemeProvider theme={lightTheme}>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="fixed">
          <Toolbar>

            <Button color="inherit" onClick={toLanding}>Landing</Button>
            <Button color="inherit" onClick={toReviews}>Reviews</Button>
            <Button color="inherit" onClick={toMyPage}>Actors</Button>
          </Toolbar>
        </AppBar>
      </Box>

      <Box
        sx={{
          minHeight: "100vh",
          opacity: opacityValue,
          position: "stretch",
          backgroundColor: lightTheme.palette.background.default
        }}
      >
        <MainGridContainer
          container
          spacing={1}
          style={{ maxWidth: '50%' }}
          direction="column"
          justify="flex-start"
          alignItems="stretch"
        >
          <Typography variant="h3" gutterBottom component="div" style={{marginTop: "100px"}}>
            Search
          </Typography>
          Movie Title:
          <Grid>
            <TextField
              required
              id='title'
              onChange={onChangeTitle}
              value={titleSearchTerm}
              style={{ width: 600, marginBottom: lightTheme.spacing(4) }}
              singleline
            />
          </Grid>
            Director:
          <Grid>
            <TextField
              required
              id='director'
              onChange={onChangeDirector}
              value={directorSearchTerm}
              style={{ width: 600, marginBottom: lightTheme.spacing(4) }}
              singleline
            />
          </Grid>
            Actor:
          <Grid>
            <TextField
              required
              id='actors'
              value={actorSearchTerm}
              onChange={onChangeActor}
              style={{ width: 600, marginBottom: lightTheme.spacing(4) }}
              singleline
            />
          </Grid>

          <Button
          variant="contained"
          color="primary"
          style={{width: 600}}
          onClick={handleMoviesSearch}>
          Search
          </Button>
          
          <Typography variant="h3" gutterBottom component="div" style={{marginTop: "100px"}}>
            Results
          </Typography>
          <List
            moviesList={moviesList}
          />

        </MainGridContainer>
      </Box>
    </ThemeProvider>
  )
};

const List = ({ moviesList }) => {
  return (
    <>
      {moviesList.map((item) => {
        return (
          <Grid item style={{width: 600}}>
            <Item
              item={item}
            />
          </Grid>
        );
      })}
    </>

  )
}

const Item = ({ item }) => {

  const rating = () => {
    if(item.averageScore == null){
      return "N/A"
    }
    else{
      return (item.averageScore).toFixed(1) + "/5"
    }
  }
  return (
    <MoviePaper>
      <Typography
        style={{ marginBottom: lightTheme.spacing(2) }}
        variant="h4"
        gutterTop
        component="div"
      >
        {item.name}
      </Typography>

      <Typography
        variant="h6"
        component="div"
        style={{ marginTop: lightTheme.spacing(1) }}
      >
        Director(s): {item.directorName}
      </Typography>

      <Typography
        variant="h6"
        component="div"
        style={{ marginTop: lightTheme.spacing(1) }}
      >
        Average score: {rating()}
      </Typography>

      <Typography
        variant="h6"
        component="div"
        style={{ marginTop: lightTheme.spacing(1) }}
      >
        Review(s):
      </Typography>
      
      <ReviewList list={item.content}/>
    </MoviePaper>
  )
}

const ReviewList = ({ list }) => {
  if(list == null){
    return "There are no reviews for this movie"
  }
  return (
    <>
      {list.map((item) => {
        return (
          <div style={{ marginTop: lightTheme.spacing(1) }}>
            - "{item}"
          </div>
        );
      })}
    </>

  )
}

export default Search;