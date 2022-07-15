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
      default: "#aabbff"
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
  margin: theme.spacing(4),
}))


const App = () => {

  const [submittedReviews, setSubmittedReviews] = React.useState([]);

  //I had ideas to put images for each movie to go along with it
  //I only have plans to do so for now, so excuse the poor form
  const movies = [
    {
      title: "Morbius",
    },
    {
      title: "Shrek",
    },
    {
      title: "Space Jam 2",
    },
    {
      title: "Sonic the Hedgehog 2",
    },
    {
      title: "Despicable Me",
    },
  ];

  const template = () => {
    return ({
      title: "",
      rating: "",
      movie: "",
      body: "",
      reviewID: submittedReviews.length + 1,
    })
  }

  /*initial state statement */
  const [Reviews, setReviews] = React.useState(template());
  const [PastReviews, setPastReviews] = React.useState(submittedReviews);
  const [MovieList, setMovieList] = React.useState([]);

  React.useEffect(() => { setPastReviews(submittedReviews) }, [submittedReviews]);

  React.useEffect(() => { setReviews(template()) }, [PastReviews]);

  React.useEffect(() => { loadMovies() }, []);

  const loadMovies = () => {
    callApiLoadMovies()
      .then(res => {
        console.log("callApiLoadRecipes returned: ", res)
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

  const handleUpdate = (item) => {
    setSubmittedReviews(current => [item, ...current]);
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
        reviewID: item.reviewID,
        body: item.body,
        title: item.title,
        score: item.rating,
        movieID: item.movie
      })
    });
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    console.log(body.message);
    return body;
  }

  /*backround settings, header and display initalizing code*/
  return (
    <ThemeProvider theme={lightTheme}>
      <Box
        sx={{
          maxHeight: "100%",
          opacity: opacityValue,
          overflow: "auto",
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
          <Typography variant="h3" gutterBottom component="div">
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
  }

  const onSubmit = () => {
    onUpdate({ title: title, body: body, rating: rating, movie: movie, reviewID: item.reviewID });

    setBody("");
    setTitle("");
    setRating("");
    setMovie("");

    setBodyBlank(true);
    setTitleBlank(true);
    setRatingBlank(true);
    setMovieBlank(true);

    setSubmitted(true);
  }

  const onCloseSubmit = () => {
    setSubmitted(false);
  }

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
            {movie === "" ?
              <div>(Please state the movie for review)</div>
              : <></>}
            <Grid>
              <Select
                labelId="movie-label"
                id="movie"
                value={movie}
                onChange={onChangeMovie}
                style={{ width: 600, marginBottom: lightTheme.spacing(4) }}
              >
                {movies.map(value =>
                  <MenuItem value={value.id}>{value.name}</MenuItem>
                )}
              </Select>
            </Grid>

            Title:
            {title === "" ?
              <div>(Please put a title for this review)</div>
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
            {body === "" ?
              <div>(Please put down your review)</div>
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
            {rating === "" ?
              <div>(Please put your rating for the movie)</div>
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
              {(bodyBlank || titleBlank || movieBlank || ratingBlank) ?
                <DisabledButton label={'Submit'} />
                :
                <ReviewButton
                  label={'Submit'}
                  onButtonClick={onSubmit}
                />
              }
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
          Movie: {item.movie}
        </Grid>
        <Grid item>
          Title: {item.title}
        </Grid>
        <Grid item>
          Rating: {item.rating}/5
        </Grid>
        <Grid item>
          Body: {item.body}
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


export default App;