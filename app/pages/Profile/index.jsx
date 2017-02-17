import React, {Component} from "react";
import {connect} from "react-redux";
import {fetchStats, fetchVars} from "actions/profile";
import {Stat, Topics} from "datawheel-canon";
import "./intro.css";

import {strip} from "d3plus-text";
import {Geomap} from "d3plus-react";

import CropsAreaVsValue from "./agriculture/CropsAreaVsValue";
import CropsByHarvest from "./agriculture/CropsByHarvest";
import CropsByProduction from "./agriculture/CropsByProduction";

import RainfallBars from "./climate/RainfallBars";

import Conditions from "./health/Conditions";
import ConditionsByGender from "./health/ConditionsByGender";
import ConditionsByResidence from "./health/ConditionsByResidence";

import Poverty from "./poverty/Poverty";
import PovertyByGender from "./poverty/PovertyByGender";

const topics = [
  {
    title: "Agriculture",
    sections: [
      CropsByHarvest,
      CropsByProduction,
      CropsAreaVsValue
    ]
  },
  {
    title: "Climate",
    sections: [
      RainfallBars
    ]
  },
  {
    title: "Health",
    sections: [
      Conditions,
      ConditionsByGender,
      ConditionsByResidence
    ]
  },
  {
    title: "Poverty",
    sections: [
      Poverty,
      [PovertyByGender, {povertyLevel: "ppp1"}],
      [PovertyByGender, {povertyLevel: "ppp2"}]
    ]
  }
];

topics.forEach(s => {
  s.slug = strip(s.title).toLowerCase();
  s.image = `/images/topics/${s.slug}.svg`;
});

class Profile extends Component {

  render() {

    const {id} = this.props.params;
    const {attrs, focus, stats} = this.props;
    const attr = attrs.geo[id];
    const focusISO = focus.map(f => attrs.geo[f].iso3);
    const isAdm0 = attr.level === "adm0";
    const topoPath = isAdm0 ? "/topojson/continent.json" : "/topojson/cell5m/adm1.json";
    const topoFilt = isAdm0 ? d => d : d => adm0 === d.properties.geo.slice(5, 10);
    const fillAdm0 = d => d.properties.iso_a3 === attr.iso3 ? "white" : focusISO.includes(d.properties.iso_a3) ? "rgba(255, 255, 255, 0.35)" : "rgba(255, 255, 255, 0.1)";
    const fillAdm1 = d => d.properties.geo === id ? "white" : focusISO.includes(d.properties.iso_a3) ? "rgba(255, 255, 255, 0.35)" : "rgba(255, 255, 255, 0.1)";
    const fill = isAdm0 ? fillAdm0 : fillAdm1;
    const adm0 = id.slice(5, 10);

    return (
      <div className="profile">

        <div className="intro">

          <div className="splash" style={{backgroundImage: `url('/images/geo/${attr.id}.jpg')`}}>
            <div className="gradient"></div>
          </div>

          <div className="header">
            <Geomap config={{
              ocean: "transparent",
              padding: 0,
              shapeConfig: {Path: {
                fill,
                stroke: "rgba(255, 255, 255, 0.25)"
              }},
              tiles: false,
              topojson: topoPath,
              topojsonFilter: topoFilt,
              topojsonKey: "collection",
              zoom: false
            }} />
            <div className="meta">
              <div className="title">{ attr.name }</div>
              { stats.map(stat => <Stat key={ stat.key } label={ stat.label } value={ stat.attr ? attrs[stat.attr][stat.value].name : stat.value } />) }
            </div>
          </div>

          <div className="subnav">
            { topics.map(s =>
              <a className="sublink" href={ `#${s.slug}` } key={ s.slug }>
                <img className="icon" src={ s.image } />
                { s.title }
              </a>) }
          </div>

        </div>

        <Topics data={topics} profile={attr} />

      </div>
    );
  }
}

Profile.need = [
  fetchStats,
  fetchVars
];

export default connect(state => ({
  attrs: state.attrs,
  focus: state.focus,
  stats: state.profile.stats
}), {})(Profile);
