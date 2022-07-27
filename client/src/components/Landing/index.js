import React from 'react';
import Link from '@material-ui/core/Link';
import history from '../Navigation/history';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { MuiThemeProvider, createTheme, ThemeProvider, styled, getContrastRatio } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";

import HorizontalScroller from 'react-horizontal-scroll-container';

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
}))

const LandingPaper = styled(Paper)(({ theme }) => ({
  opacity: 0.7,
  backgroundColor: theme.palette.primary.background,
  padding: 8,
  borderRadius: 4,
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  width: 300
}));

const Landing = () => {

  const toSearch = () => {
    history.push('/search')
  }

  const toReviews = () => {
    history.push('/reviews')
  }

  const toMyPage = () => {
    history.push('/actors')
  }

  const [PastReviews, setPastReviews] = React.useState([]);
  const [MovieList, setMovieList] = React.useState([]);

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
        setPastReviews(parsed);
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

  return (
    <ThemeProvider theme={lightTheme}>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="fixed">
          <Toolbar>
            <Button color="inherit" onClick={toSearch}>Search</Button>
            <Button color="inherit" onClick={toReviews}>Reviews</Button>
            <Button color="inherit" onClick={toMyPage}>Actors</Button>
          </Toolbar>
        </AppBar>
      </Box>
      <Box
        sx={{
          minHeight: "100vh",
          maxWidth: "100%",
          opacity: opacityValue,
          position: "center",
          backgroundColor: lightTheme.palette.background.default
        }}
      >
        <MainGridContainer
          container
          spacing={0}
          style={{ maxHeight: '50%' }}
          direction="column"
          justify="flex-start"
          alignItems="fixed"
        >
          <Typography variant="h4" gutterBottom component="div" style={{ marginTop: "100px", marginLeft: "20px" }}>
            Recent Reviews
          </Typography>
          <HorizontalScroller>
            <RecentReviewsList
              list={PastReviews.slice(0, 10)}
            />
          </HorizontalScroller>

          <Typography variant="h4" gutterBottom component="div" style={{ marginTop: "100px", marginLeft: "20px" }}>
            Newest Movies
          </Typography>
          <HorizontalScroller>
            <NewMoviesList
              list={MovieList.slice(0, 10)} />
          </HorizontalScroller>
        </MainGridContainer>
      </Box>
    </ThemeProvider >
  )

}

const RecentReviewsList = ({ list }) => {
  return (
    <Box style={{ display: 'flex', height: 400, gap: 10, padding: "20px" }}>
      {list.map((item) => {
        return (
          <LandingPaper>
            <Grid>
              <Typography variant="h4" gutterBottom component="div">
                {item.reviewTitle}
              </Typography>
              <Typography variant="h6" gutterBottom component="div">
                Movie: {item.name}
              </Typography>
              <Typography variant="h6" gutterBottom component="div">
                Score: {item.score}/5
              </Typography>
              <div>
                {item.reviewContent}
              </div>
            </Grid>
          </LandingPaper>
        );
      })}
    </Box>

  )
}

const NewMoviesList = ({ list }) => {
  return (
    <Box style={{ display: 'flex', height: 800, gap: 10, padding: "20px" }}>
      {list.map((item) => {
        return (
          <LandingPaper>
            <Grid>
              <Typography variant="h4" gutterBottom component="div">
                {item.name}
              </Typography>
              <Typography variant="h6" gutterBottom component="div">
                Director(s): {item.directorName}
              </Typography>
              <Typography variant="h6" gutterBottom component="div">
                Score: {item.score}/5
              </Typography>
              <Typography variant="h6" gutterBottom component="div">
                Cast:
              </Typography>
              <ActorList list={item.actorName.slice(0, 20)} />
            </Grid>
          </LandingPaper>
        );
      })}
    </Box>

  )
}

const ActorList = ({ list }) => {
  return (
    <div>
      {list.map((item) => {
        return (
          <Grid>
            {item}
          </Grid>
        );
      })}
    </div>

  )
}

export default Landing;