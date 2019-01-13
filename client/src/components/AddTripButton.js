import React, { Component } from "react"
import { Button } from "../styles/theme/styledComponents"

const AddTripButton = () => {
  return (
    <div className="addTripButton">
      <a>Add Trip</a>
      <Button>+</Button>
    </div>
  )
}

export default AddTripButton