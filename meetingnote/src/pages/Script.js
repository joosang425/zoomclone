import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import MeetScript from "../Components/Meetscript";
import Summary from "../Components/summary";
import ScriptTitle from "../Components/scriptTitle";


const useStyles = makeStyles((theme) => ({
  listTitle: {
    paddingTop: "4%",
    marginBottom: "15%"
  },
  body: {
    minWidth: 1230,
    height: window.innerHeight - 60,
    justifyContent: "center"
  },
}));

function getUrlParams() {
  var params = {};
  window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str, key, value) { params[key] = value; });
  return params;
}

export default function Script() {
  const classes = useStyles();
  const meet_id = getUrlParams().meet_id;

  return (
    <div style={{ display: "flex", minWidth: 1230 }}>
      <div style={{width: "100%", height:"90%"}}>
            <div className={classes.body}>
              < ScriptTitle meet_id={meet_id} />
              <div style={{ display: "flex", height: "85%", width: "95%", justifyContent:"center"}}>
                <div style={{ height: "88%", width: "98%", justifyContent:"center",marginTop:"20px"}}>
                  < Summary meet_id={meet_id} />  
                </div>
                < MeetScript meet_id={meet_id} />
              </div>
            </div>
      </div>
    </div>
  );
}