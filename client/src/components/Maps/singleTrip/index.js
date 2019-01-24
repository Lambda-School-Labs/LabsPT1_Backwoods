import React from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import { MapWrapper } from "../../../styles/CreateTrip.styles"
import TripPanel from "../singleTrip/tripPanel"
import ActiveTripPanel from "./activePanel"

import { TripPropTypes, getDefaultTripProps } from "../../propTypes"
import { getSingleTrip } from "../../../redux/actions/trips"

const dashSymbol = {
  path: "M 0,-1 0,1",
  strokeOpacity: 1,
  scale: 3
}

class SingleTripMap extends React.Component {
  static defaultProps = {
    getSingleTrip: () => {},
    trip: getDefaultTripProps(),
    tripId: ""
  }

  componentDidMount() {
    this.props.getSingleTrip(this.props.tripId)
    window.elevation = new window.google.maps.ElevationService()
  }

  componentDidUpdate() {
    const { trip } = this.props
    const lat = trip.lat
    const lng = trip.lon
    const center = { lat, lng }
    if (trip && trip.waypoints) this.renderMap(center)
    // this.drawPolyline()
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.isSidebarOpen !== this.props.isSidebarOpen) return false
    return true
  }

  //Attaches Map to div
  // TODO? Store users last zoom level for UX improvment - otherwise default to 9
  renderMap = center => {
    window.map = new window.google.maps.Map(
      document.getElementById("Tripmap"),
      {
        center: center,
        zoom: 9,
        disableDefaultUI: true
      }
    )
  }

  drawPolyline = waypoints => {
    const path = waypoints.map(w => ({
      lat: w.lat,
      lng: w.lon
    }))

    const polyline = new window.google.maps.Polyline({
      path,
      strokeColor: "#1e306e",
      strokeOpacity: 0,
      strokeWeight: 2,
      icons: [
        {
          icon: dashSymbol,
          offset: 0,
          repeat: "20px"
        }
      ]
    })

    window.polyline = polyline

    polyline.setMap(window.map)
  }

  // Add conditional rendering for active Trip
  render() {
    if (this.props.trip !== null) {
      return (
        <MapWrapper>
          {!this.props.trip.inProgress ? (
            <TripPanel drawPolyline={this.drawPolyline} />
          ) : (
            <ActiveTripPanel />
          )}
          <div
            style={{ width: "100%", height: "100%", position: "absolute" }}
            id="Tripmap"
          />
        </MapWrapper>
      )
    } else {
      return null
    }
  }
}

SingleTripMap.propTypes = {
  getSingleTrip: PropTypes.func.isRequired,
  isSidebarOpen: PropTypes.bool.isRequired,
  trip: TripPropTypes,
  tripId: PropTypes.string.isRequired
}

const mapStateToProps = state => ({
  trip: state.trips.activeTrip,
  isSidebarOpen: state.navigation.isSidebarOpen
})

export default connect(
  mapStateToProps,
  { getSingleTrip }
)(SingleTripMap)
