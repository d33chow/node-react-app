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
import Paper from "@material-ui/core/Paper";
import TextField from '@material-ui/core/TextField';
import Plot from 'react-plotly.js';

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

const MyPagePaper = styled(Paper)(({ theme }) => ({
  opacity: 0.7,
  backgroundColor: theme.palette.primary.background,
  width: 600,
  height: 800,
  padding: 8,
  borderRadius: 4, 
  marginLeft: "20px",
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2)
}));

const MyPage = () => {

  const toLanding = () => {
    history.push('/')
  }

  const toSearch = () => {
    history.push('/search')
  }

  const toReviews = () => {
    history.push('/reviews')
  }

  const [actorSearchTerm, setActorSearchTerm] = React.useState('');

  const [actorList, setActorList] = React.useState([]);

  const onChangeActor = (event) => {
    setActorSearchTerm(event.target.value);
  }


  const handleActorSearch = () => {
    callApiFindActors()
      .then(res => {
        console.log("callApiFindActors returned: ", res)
        var parsed = JSON.parse(res.express);
        console.log("callApiFindActors parsed: ", parsed[0])
        setActorList(parsed);
      });
  }

  const callApiFindActors = async () => {

    const url = serverURL + "/api/findActors";
    console.log(url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        actorSearchTerm: "%" + actorSearchTerm + "%"
      })
    });
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    console.log("Found Actors: ", body);
    return body;
  }

  return (
    <ThemeProvider theme={lightTheme}>
      <Box sx={{ flexGrow: 1, maxWidth: '100%' }}>
        <AppBar position="fixed">
          <Toolbar>

            <Button color="inherit" onClick={toLanding}>Landing</Button>
            <Button color="inherit" onClick={toSearch}>Search</Button>
            <Button color="inherit" onClick={toReviews}>Reviews</Button>
          </Toolbar>
        </AppBar>
      </Box>
      <Box
        sx={{
          minHeight: "100vh",
          maxWidth: '100vw',
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
          <Typography variant="h3" gutterBottom component="div" style={{ marginTop: "100px", marginLeft: "20px" }}>
            Actor Profile Database Search
          </Typography>
          <div style={{ marginLeft: "20px" }}>Search actors for their profile</div>

          <Grid>
            <TextField
              required
              id='actors'
              value={actorSearchTerm}
              onChange={onChangeActor}
              style={{ width: 600, marginBottom: lightTheme.spacing(4), marginLeft: "20px" }}
              singleline
            />
          </Grid>

          <Button
          variant="contained"
          color="primary"
          style={{width: 600, height: 100, marginLeft: "20px"}}
          onClick={handleActorSearch}>
          Search
          </Button>

          <Typography variant="h3" gutterBottom component="div" style={{marginTop: "100px", marginLeft: "20px"}}>
            Results
          </Typography>

          <ActorList list={actorList} />
        </MainGridContainer>
      </Box>
    </ThemeProvider>
  )

}

const ActorList = ({ list }) => {
  return (
    <>
      {list.map((item) => {
        return (
          <Grid item>
            <ActorProfile
              item={item}
            />
          </Grid>
        );
      })}
    </>

  )
}

const ActorProfile = ({ item }) => {

  return (
    <MyPagePaper>
      <Box>
        <Typography variant="h4" gutterBottom component="div" style={{ marginTop: "20px"}}>
          {item.actorName}
        </Typography>
        <Typography variant="h6" gutterBottom component="div" style={{ marginTop: "20px"}}>
          Recent Roles:
        </Typography>
        <RoleList list={item.roles.slice(0,5)}/>

      </Box>
      <Box>
        <Typography variant="h6" gutterBottom component="div" style={{ marginTop: "20px"}}>
          Movie genres {item.actorName} has been casted for:
        </Typography>

        <PieChart list={item.genres} />

      </Box>
    </MyPagePaper>
  )
}

const RoleList = ({ list }) => {
  if(list == null){
    return "This actor has no roles"
  }
  return (
    <>
      {list.map((item) => {
        return (
          <div style={{ marginTop: lightTheme.spacing(1) }}>
            - {item}
          </div>
        );
      })}
    </>

  )
}

const PieChart = ({ list }) => {
  const freqList = list.reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map());
  console.log(freqList)
  var l = Array.from(freqList.keys())
  console.log(l)
  var v = Array.from(freqList.values())
  console.log(v)
  var data = [{labels: l, values: v, type: "pie"}]

  return(
    <Plot
    data={data}
    layout={ {width: 450, height: 450} } />
  )
}
export default MyPage;