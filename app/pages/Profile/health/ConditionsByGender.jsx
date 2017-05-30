import React from "react";
import {titleCase} from "d3plus-text";

import {BarChart} from "d3plus-react";
import {SectionColumns, SectionTitle} from "datawheel-canon";

import {COLORS_GENDER} from "helpers/colors";
import {tooltipBody, yearControls} from "helpers/d3plus";
import {formatPlaceName, FORMATTERS} from "helpers/formatters";
import {fetchData} from "datawheel-canon";
import {childHealthByMode} from "pages/Profile/health/shared";

class ConditionsByGender extends SectionColumns {

  render() {
    const {profile} = this.props;
    const {healthByGender} = this.context.data;

    return (
      <SectionColumns>
        <article className="section-text">
        <SectionTitle>Health Conditions Among Children by Gender</SectionTitle>
          {childHealthByMode(profile, healthByGender, "gender")}
        </article>
        <BarChart config={{
          controls: yearControls(healthByGender),
          data: healthByGender,
          discrete: "y",
          groupBy: ["gender", "severity"],
          groupPadding: 32,
          label: d => d.condition instanceof Array ? `${titleCase(d.gender)} ${titleCase(d.severity)}` : `${titleCase(d.severity)}ly ${titleCase(d.condition)} ${titleCase(d.gender)}s`,
          shapeConfig: {
            fill: d => COLORS_GENDER[d.gender],
            hoverOpacity: 0.2,
            label: false,
            opacity: d => d.severity === "severe" ? 1 : 0.5
          },
          stacked: true,
          stackOrder: ["male_severe", "male_moderate", "female_severe", "female_moderate"],
          time: "year",
          tooltipConfig: {
            body: d => `${ d.dhs_geo_name !== profile.name ? `<span class="d3plus-body-sub">Based on data from ${formatPlaceName(d, "health", profile.level)}</span>` : "" }${tooltipBody.bind(["year", "proportion_of_children"])(d)}`
          },
          x: "proportion_of_children",
          xConfig: {
            domain: [0, 1],
            tickFormat: FORMATTERS.shareWhole,
            title: "Proportion of Children"
          },
          y: "condition",
          yConfig: {
            gridSize: 0,
            tickFormat: d => titleCase(d),
            title: "Condition"
          }
        }} />
    </SectionColumns>
    );
  }
}

ConditionsByGender.need = [
  fetchData("healthByGender", "api/join/?geo=<id>&show=year,condition,gender&required=dhs_geo_name,dhs_geo_parent_name,proportion_of_children&sumlevel=all,all,all")
];

export default ConditionsByGender;
