import React from "react"
import EditIcon from "../../icons/EditSvg"
import DeleteIcon from "../../icons/DeleteSvg"
import { TripPropTypes } from "../../propTypes"
import DistanceIcon from "../../icons/DistanceSvg"
import ElevationIcon from "../../icons/ElevationSvg"
import SaveIcon from "../../icons/SaveSvg"
import AddIcon from "../../icons/AddSvg"
import { connect } from "react-redux"
import * as util from "./mapUtil"
import * as s from "./components"

class TripPanel extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isEditing: false,
      saveToggle: false,
      trip: {},
      markers: [],
      elevation: null,
      tripDistance: null
    }
  }

  componentDidMount() {
    this.setState({ trip: this.props.trip }, () => {
      this.renderWaypoints()
    })
  }

  //Use Andrews Elevation Implementation
  componentDidUpdate(_, prevState) {
    if (prevState.markers !== this.state.markers) {
      // this.getPathElevation()
      this.getPathDistance()
    }
  }

  //TODO - fix map updates with added waypoint movements
  addWaypoint = () => {
    const index = this.state.markers.length
    let marker = new window.google.maps.Marker({
      position: window.map.getCenter(),
      map: window.map,
      draggable: true,
      title: (index + 1).toString(),
      label: (index + 1).toString(),
      index: index
    })
    let markers = this.state.markers
    marker.addListener("dragend", ev => {
      let waypoints = this.state.trip.waypoints.map((item, i) => {
        if (index === i)
          return { ...item, lat: ev.latLng.lat(), lon: ev.latLng.lng() }
        else return item
      })
      this.setState({ trip: { ...this.state.trip, waypoints } })
    })
    let waypoint = {
      name: `Checkpoint ${index}`,
      tripId: this.props.trip.id,
      order: index + 1,
      lat: marker.getPosition().lat(),
      lon: marker.getPosition().lng(),
      start: new Date(),
      end: new Date()
    }
    let waypoints = this.state.trip.waypoints
    waypoints.push(waypoint)
    markers.push(marker)
    this.setState({ markers, trip: { ...this.state.trip, waypoints } })
  }

  renderWaypoints = () => {
    let markers = []
    this.state.trip.waypoints.forEach(waypoint => {
      const center = {
        lat: parseFloat(waypoint.lat.$numberDecimal),
        lng: parseFloat(waypoint.lon.$numberDecimal)
      }
      let marker = new window.google.maps.Marker({
        position: center,
        map: window.map,
        title: waypoint.name,
        label: `${waypoint.order}`,
        draggable: false
      })

      markers.push(marker)
    })
    this.setState({ markers })
  }

  handleEditToggle = () => {
    this.setState({ isEditing: true, saveToggle: true }, () => {
      this.toggleDraggable()
    })
  }

  handleTitle = e => {
    this.setState({ trip: { ...this.state.trip, name: e.target.value } })
  }

  renderWaypointList = waypoints => {
    if (waypoints) {
      return waypoints.map((_, i) => {
        return (
          <s.Waypoint key={i}>
            <s.WaypointLabel>{i + 1}</s.WaypointLabel>
            <s.WaypointInput
              type="text"
              disabled={this.state.isEditing === false}
              edit={this.state.isEditing}
              placeholder="waypoint title"
              value={this.state.trip.waypoints[i].name}
              onChange={e => {
                this.handleEdit(e, i)
              }}
            />

            <s.DeleteButton
              disabled={this.state.isEditing === false}
              edit={this.state.isEditing}
              onClick={() => {
                this.handleDelete(i)
              }}
            >
              <DeleteIcon width="22px" height="22px" />
            </s.DeleteButton>
          </s.Waypoint>
        )
      })
    }
  }

  handleDelete = i => {
    const temp = this.state.trip.waypoints.filter((_, index) => {
      return i !== index
    })
    const reOrder = this.updateOrder(temp)
    this.setState({ trip: { ...this.state.trip, waypoints: reOrder } })
    this.deleteMapMarkers(i)
  }

  updateOrder = waypoints => {
    return waypoints.map((item, i) => {
      return { ...item, order: i }
    })
  }

  toggleDraggable = () => {
    this.state.markers.forEach(marker => {
      marker.setDraggable(this.state.isEditing)
    })
  }

  handleEdit = (e, i) => {
    const mapped = this.state.trip.waypoints.map((item, index) => {
      if (index === i) {
        return { ...item, name: e.target.value }
      }
      return item
    })
    this.setState({ trip: { ...this.state.trip, waypoints: mapped } })
  }

  deleteMapMarkers = i => {
    this.state.markers.forEach((item, index) => {
      if (i === index && item) {
        item.setMap(null)
      }
    })
    let updatedMarkers = this.state.markers.filter((_, index) => {
      return i !== index
    })
    updatedMarkers.forEach((item, index) => {
      item.setLabel(`${index + 1}`)
    })

    this.setState({ markers: updatedMarkers })
  }

  handleSave = () => {
    this.setState({ saveToggle: false, isEditing: false }, () => {
      this.toggleDraggable()
    })
  }

  // Use Andrews Elevation implementation

  // getPathElevation = () => {
  //   if (this.state.markers.length > 1) {
  //     let latlngs = this.state.markers.map(marker => {
  //       return {
  //         lat: marker.getPosition().lat(),
  //         lng: marker.getPosition().lng()
  //       }
  //     })
  //     util.getPathElevation(latlngs).then(res => {
  //       this.setState({ elevation: res.toFixed(2) })
  //     })
  //   }
  // }

  getPathDistance = () => {
    if (this.state.markers.length > 1) {
      let latngs = this.state.markers.map(marker => {
        return {
          lat: marker.getPosition().lat(),
          lng: marker.getPosition().lng()
        }
      })
      util.calcTotalDistance(latngs).then(res => {
        this.setState({ tripDistance: res.toFixed(2) })
      })
    }
  }

  render() {
    return (
      <s.Panel>
        <s.PanelHeader>
          <s.TripTitleInput
            type="text"
            edit={this.state.isEditing}
            value={this.state.trip.name}
            onChange={this.handleTitle}
            disabled={this.state.isEditing === false}
          />
          {!this.state.saveToggle ? (
            <s.EditButton
              onClick={() => {
                this.handleEditToggle()
              }}
            >
              <EditIcon width="20px" height="20px" />
            </s.EditButton>
          ) : (
            <s.SaveButton
              onClick={() => {
                this.handleSave()
              }}
            >
              <SaveIcon width="20px" height="20px" />
            </s.SaveButton>
          )}
        </s.PanelHeader>
        <s.PanelSubheader>
          <s.TripDetail>
            <DistanceIcon width="25px" height="25px" />
            {this.state.tripDistance}m
          </s.TripDetail>
          <s.TripDetail>
            <ElevationIcon width="25px" height="25px" />
            {this.state.elevation}m
          </s.TripDetail>
        </s.PanelSubheader>
        <s.WaypointsHeader>
          <h4>Waypoints</h4>
          <s.AddButton
            disabled={this.state.isEditing === false}
            edit={this.state.isEditing}
            onClick={() => {
              this.addWaypoint()
            }}
          >
            <AddIcon height="18px" width="18px" />
          </s.AddButton>
        </s.WaypointsHeader>
        <s.WaypointList>
          {this.renderWaypointList(this.state.trip.waypoints)}
        </s.WaypointList>
        <s.StartButton>Start Trip</s.StartButton>
      </s.Panel>
    )
  }
}

const mapStateToProps = state => {
  return { trip: state.trips.activeTrip }
}

TripPanel.PropTypes = {
  trip: TripPropTypes
}

export default connect(mapStateToProps)(TripPanel)