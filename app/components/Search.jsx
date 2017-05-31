import React, {Component} from "react";
import {browserHistory, Link} from "react-router";

import {API} from "helpers/consts.js";
import axios from "axios";

import {strip} from "d3plus-text";
import {dataFold} from "d3plus-viz";

class Search extends Component {

  constructor(props) {
    super(props);
    this.state = {
      active: false,
      results: []
    };
  }

  onChange(e) {

    const userQuery = e.target.value;
    const {limit}  = this.props;

    if (userQuery.length === 0) this.setState({active: true, results: []});
    // else if (userQuery.length < 3) return;
    else {
      axios.get(`${API}attrs/search/?q=${strip(userQuery)}`)
        .then(res => {
          let results = dataFold(res.data);
          if (limit) results = results.slice(0, limit);
          this.setState({active: true, results});
        });
    }

  }

  onToggle() {

    const {active} = this.state;
    this.setState({active: !active});

  }

  componentDidMount() {

    document.addEventListener("keydown", () => {

      const {active} = this.state;
      const key = event.keyCode;
      const DOWN = 40,
            ENTER = 13,
            ESC = 27,
            S = 83,
            UP = 38;

      if (!active && key === S && event.target.tagName.toLowerCase() !== "input") {
        event.preventDefault();
        this.onToggle();
      }
      else if (active && key === ESC && event.target === this.refs.input) {
        event.preventDefault();
        this.onToggle();
      }
      else if (active && event.target === this.refs.input) {

        const highlighted = document.querySelector(".highlighted");

        if (key === ENTER && highlighted) {
          this.refs.input.value = highlighted.querySelector("a").innerHTML;
          this.onToggle();
          setTimeout(() => {
            browserHistory.push(highlighted.querySelector("a").href);
          }, 500);
        }
        else if (key === DOWN || key === UP) {

          if (!highlighted) {
            if (key === DOWN) document.querySelector(".results > li:first-child").classList.add("highlighted");
          }
          else {

            const results = document.querySelectorAll(".results > li");

            const currentIndex = [].indexOf.call(results, highlighted);

            if (key === DOWN && currentIndex < results.length - 1) {
              results[currentIndex + 1].classList.add("highlighted");
              highlighted.classList.remove("highlighted");
            }
            else if (key === UP) {
              if (currentIndex > 0) results[currentIndex - 1].classList.add("highlighted");
              highlighted.classList.remove("highlighted");
            }
          }
        }

      }

    }, false);

  }

  render() {

    const {className} = this.props;
    const {active, results} = this.state;
    const InactiveComponent = this.props.inactiveComponent;

    if (this.refs.input) {
      if (active) this.refs.input.focus();
      else this.refs.input.blur();
    }

    return (
      <div className={ `${className} ${ active ? "active" : "" }` }>
        { InactiveComponent ? <InactiveComponent active={ active } toggle={ this.onToggle.bind(this) } /> : null }
        <div className={ active ? "input active" : "input" }>
          <img className="icon" src="/images/nav/search.svg" />
          <input type="text" ref="input" onChange={ this.onChange.bind(this) } placeholder="Enter a location" />
        </div>
        <ul className={ active ? "results active" : "results" }>
          { results.map(result =>
            <li key={ result.id } className="result">
              <Link to={ `/profile/${result.id}` }>{ result.name }</Link>
            </li>
          )}
        </ul>
      </div>
    );

  }
}

Search.defaultProps = {
  className: "search",
  inactiveComponent: false
};

export default Search;
