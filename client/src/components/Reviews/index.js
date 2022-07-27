import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { MuiThemeProvider, createTheme, ThemeProvider, styled } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Box from "@material-ui/core/Box";
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import history from '../Navigation/history';

//Dev mode
//const serverURL = "ec2-18-216-101-119.us-east-2.compute.amazonaws.com:3092"; //enable for dev mode
const serverURL = ""; //enable for dev mode

//Deployment mode instructions
//const serverURL = "http://ov-research-4.uwaterloo.ca:PORT"; //enable for deployed mode; Change PORT to the port number given to you;
//To find your port number: 
//ssh to ov-research-4.uwaterloo.ca and run the following command: 
//env | grep "PORT"
//copy the number only and paste it in the serverURL in place of PORT, e.g.: const serverURL = "http://ov-research-4.uwaterloo.ca:3000";

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

const ReviewPaper = styled(Paper)(({ theme }) => ({
  opacity: 0.7,
  backgroundColor: theme.palette.primary.background,
  padding: 8,
  borderRadius: 4,
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2)
}));

const MainGridContainer = styled(Grid)(({ theme }) => ({
  marginLeft: theme.spacing(4),
}))


const Reviews = () => {

  const template = () => {
    return ({
      title: "",
      rating: "",
      movie: "",
      body: ""
    })
  }

  /*initial state statement */
  const [Reviews, setReviews] = React.useState(template());
  const [PastReviews, setPastReviews] = React.useState([]);
  const [MovieList, setMovieList] = React.useState([]);

  React.useEffect(() => { setReviews(template()) }, [PastReviews]);

  React.useEffect(() => { loadMovies() }, []);

  React.useEffect(() => { loadReviews() }, []);

  const loadMovies = () => {
    callApiLoadMovies()
      .then(res => {
        console.log("callApiLoadMovies returned: ", res)
        var parsed = JSON.parse(res.express);
        setMovieList(parsed);
      })
  }

  const callApiLoadMovies = async () => {
    const url = serverURL + "/api/loadMovies";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }
    });
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  }

  const loadReviews = () => {
    callApiLoadReviews()
      .then(res => {
        console.log("callApiLoadReviews returned: ", res)
        var parsed = JSON.parse(res.express);
        setPastReviews(parsed.slice(0, 5));
      })
  }

  const callApiLoadReviews = async () => {
    const url = serverURL + "/api/loadReviews";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }
    });
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  }

  const handleUpdate = (item) => {
    callSubmitReview(item);
  }

  const callSubmitReview = async (item) => {

    const url = serverURL + "/api/submitReview";

    console.log(item);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        body: item.body,
        title: item.title,
        score: item.rating,
        movieID: item.movie
      })
    });
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    console.log(body.message);
    loadReviews();
    return body;
  }

  const toLanding = () => {
    history.push('/')
  }

  const toSearch = () => {
    history.push('/search')
  }

  const toMyPage = () => {
    history.push('/actors')
  }

  /*backround settings, header and display initalizing code*/
  return (

    <ThemeProvider theme={lightTheme}>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="fixed" justify="flex-start">
          <Toolbar>
            <Button color="inherit" onClick={toLanding}>Landing</Button>
            <Button color="inherit" onClick={toSearch}>Search</Button>
            <Button color="inherit" onClick={toMyPage}>Actors</Button>
          </Toolbar>
        </AppBar>
      </Box>

      <Box
        sx={{
          maxHeight: "100%",
          opacity: opacityValue,
          position: "flex",
          backgroundColor: lightTheme.palette.background.default,
          //backgroundImage: `url(${BackgroundImage})`,
          //backgroundSize: "cover"
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
          <Typography variant="h3" gutterBottom component="div" style={{ marginTop: "100px" }}>
            Review a Movie
          </Typography>


          <List
            list={Reviews}
            onUpdate={handleUpdate}
            movies={MovieList}
          />

        </MainGridContainer>

        <MainGridContainer
          container
          spacing={1}
          style={{ maxWidth: '50%' }}
          direction="column"
          justify="flex-start"
          alignItems="stretch"
        >
          <Typography variant="h3" gutterBottom component="div">
            Past Reviews
          </Typography>

          <ReviewList
            list={PastReviews}
          />

        </MainGridContainer>
      </Box>
    </ThemeProvider>
  );
}


/*I think this just maps out Review objects */
const List = ({ list, onUpdate, movies }) => {
  return (
    <Grid item>
      <Item
        item={list}
        onUpdate={onUpdate}
        movies={movies}
      />
    </Grid>
  )
}

/*Code relating to dynamic aspects of the web page*/
const Item = ({ item, onUpdate, movies }) => {
  const [body, setBody] = React.useState(item.body);
  const [title, setTitle] = React.useState(item.title);
  const [rating, setRating] = React.useState(item.rating);
  const [movie, setMovie] = React.useState(item.movie);


  const [bodyBlank, setBodyBlank] = React.useState(true);
  const [titleBlank, setTitleBlank] = React.useState(true);
  const [movieBlank, setMovieBlank] = React.useState(true);
  const [ratingBlank, setRatingBlank] = React.useState(true);

  const [blank, setBlank] = React.useState(false);

  const [submitted, setSubmitted] = React.useState(false);

  const onChangeBody = (event) => {
    setBody(event.target.value);
    setBodyBlank(event.target.value === "");
    //console.log(body);
  }

  const onChangeTitle = (event) => {
    setTitle(event.target.value);
    setTitleBlank(event.target.value === "");
    //console.log(title);
  }

  const onChangeRating = (event) => {
    setRating(event.target.value);
    setRatingBlank(event.target.value === "");
  };

  const onChangeMovie = (event) => {
    setMovie(event.target.value);
    setMovieBlank(event.target.value === "");
    console.log(movie)
  }

  const onSubmit = () => {
    if (!movieBlank && !bodyBlank && !titleBlank && !ratingBlank) {
      onUpdate({ title: title, body: body, rating: rating, movie: movie });

      setBody("");
      setTitle("");
      setRating("");
      setMovie("");

      setBodyBlank(true);
      setTitleBlank(true);
      setRatingBlank(true);
      setMovieBlank(true);

      setSubmitted(true);

      setBlank(false);
    }
    else{
      setBlank(true);
    }
  }

  const onCloseSubmit = () => {
    setSubmitted(false);
  }

  const divStyle = {
    color: 'red'
  };

  return (
    <ReviewPaper>

      <Typography
        variant="h6"
        component="div"
        style={{ marginTop: lightTheme.spacing(1) }}
      >
        <Grid container direction="column" justify="flex-start" alignItems="flex-start">
          <Grid>

            Movie:
            {movieBlank && blank ?
              <div style={divStyle}>(Please state the movie for review)</div>
              : <></>}
            <Grid>
              <Select
                labelId="movie-label"
                id="movie"
                value={movie}
                onChange={onChangeMovie}
                style={{ width: 600, marginBottom: lightTheme.spacing(4) }}
              >
                {movies.map(movieItem =>
                  <MenuItem value={movieItem.id}>{movieItem.name}</MenuItem>
                )}
              </Select>
            </Grid>

            Title:
            {titleBlank && blank ?
              <div style={divStyle}>(Please put a title for this review)</div>
              : <></>}
            <Grid>
              <TextField
                required
                id='title'
                onChange={onChangeTitle}
                value={title}
                style={{ width: 600, marginBottom: lightTheme.spacing(4) }}
                singleline
              />
            </Grid>

            Body:
            {bodyBlank && blank ?
              <div style={divStyle}>(Please put down your review)</div>
              : <></>}
            <Grid>
              <TextField
                required
                id='body'
                onChange={onChangeBody}
                value={body}
                style={{ width: 600, marginBottom: lightTheme.spacing(4) }}
                multiline
              />
            </Grid>

            Rating:
            {ratingBlank && blank ?
              <div style={divStyle}>(Please put your rating for the movie)</div>
              : <></>}
            <Grid>
              <FormControl component="fieldset">
                <RadioGroup row aria-label="rating-aria-label" name="rating" value={rating} onChange={onChangeRating}>
                  <FormControlLabel value="0" control={<Radio />} label="0" labelPlacement='top' />
                  <FormControlLabel value="1" control={<Radio />} label="1" labelPlacement='top' />
                  <FormControlLabel value="2" control={<Radio />} label="2" labelPlacement='top' />
                  <FormControlLabel value="3" control={<Radio />} label="3" labelPlacement='top' />
                  <FormControlLabel value="4" control={<Radio />} label="4" labelPlacement='top' />
                  <FormControlLabel value="5" control={<Radio />} label="5" labelPlacement='top' />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid>
              <ReviewButton
                  label={'Submit'}
                  onButtonClick={onSubmit}
                />
            </Grid>
            {submitted ?
              <div>Submitted!
                <SubmittedButton label={"Click to close"} onButtonClick={onCloseSubmit} /></div>
              : <></>}
            <Grid>

            </Grid>
          </Grid>
        </Grid>

      </Typography>

    </ReviewPaper >
  )
}

/* Review button code */
const ReviewButton = ({ label, onButtonClick }) => (
  <Button
    variant="contained"
    color="primary"
    onClick={() => onButtonClick()}
  >
    {label}
  </Button>
)

const DisabledButton = ({ label }) => (
  <Button
    variant="contained"
    color="secondary"
    disabled
  >
    {label}
  </Button>
)

const SubmittedButton = ({ label, onButtonClick }) => (
  <Button
    variant="text"
    color="secondary"
    onClick={() => onButtonClick()}
  >
    {label}
  </Button>
)


const ReviewList = ({ list }) => {
  return (
    <>
      {list.map((item) => {
        return (
          <Grid reviewItem>
            <ReviewItem
              item={item}
            />
          </Grid>
        );
      })}
    </>

  )
}

const ReviewItem = ({ item }) => {
  return (
    <ReviewPaper>
      <Typography
        variant="h6"
        component="div"
        style={{ marginTop: lightTheme.spacing(1) }}
      >
        <Grid item>
          Movie: {item.name}
        </Grid>
        <Grid item>
          Title: {item.reviewTitle}
        </Grid>
        <Grid item>
          Rating: {item.score}/5
        </Grid>
        <Grid item>
          Body: {item.reviewContent}
        </Grid>
      </Typography>
      <Typography
        variant="subtitle2"
        align='right'
        component="div"
        style={{ marginTop: lightTheme.spacing(1) }}
      >
        <Grid item>
          Review ID: {item.reviewID}
        </Grid>
      </Typography>
    </ReviewPaper >
  )
}


export default Reviews;