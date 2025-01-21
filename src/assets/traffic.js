{
  "sensor_readings": [
    {
      // Camera-based sensor
      "sensor_id": "CAM-NYC-5AVE-42-01",
      "sensor_type": "camera",
      "location": {
        "latitude": 40.7536,
        "longitude": -73.9832,
        "road_name": "5th Avenue",
        "intersection": "42nd Street",
        "direction": "northbound",
        "city": "New York",
        "zone": "Manhattan-Midtown"
      },
      "timestamp": "2025-01-19T14:30:00.000Z",
      "metrics": {
        "vehicle_count": 245,
        "average_speed": 28.5,
        "vehicle_classification": {
          "cars": 180,
          "buses": 15,
          "trucks": 35,
          "motorcycles": 10,
          "bicycles": 5,
          "pedestrians": 50
        },
        "lane_occupancy": [
          { "lane_number": 1, "occupancy_rate": 0.75 },
          { "lane_number": 2, "occupancy_rate": 0.82 },
          { "lane_number": 3, "occupancy_rate": 0.65 }
        ],
        "illegal_behavior": {
          "red_light_violations": 2,
          "wrong_way_driving": 0,
          "illegal_turns": 1
        },
        "image_quality": {
          "brightness": 0.85,
          "clarity": 0.92,
          "obstruction": false
        }
      }
    },
    {
      // Inductive Loop sensor
      "sensor_id": "LOOP-NYC-5AVE-42-02",
      "sensor_type": "inductive_loop",
      "location": {
        "latitude": 40.7536,
        "longitude": -73.9832,
        "road_name": "5th Avenue",
        "position": "stop_line",
        "lane_number": 1
      },
      "timestamp": "2025-01-19T14:30:00.000Z",
      "metrics": {
        "presence_time": 0.85,  // seconds vehicle present over sensor
        "vehicle_count": 82,
        "average_vehicle_length": 4.8,  // meters
        "gap_time": 2.3,  // seconds between vehicles
        "occupancy_rate": 0.75,
        "queue_length": 8,  // vehicles
        "saturation_flow_rate": 1800  // vehicles per hour
      }
    },
    {
      // Radar sensor
      "sensor_id": "RAD-NYC-5AVE-42-03",
      "sensor_type": "radar",
      "location": {
        "latitude": 40.7536,
        "longitude": -73.9832,
        "road_name": "5th Avenue",
        "mounting_height": 6.5  // meters
      },
      "timestamp": "2025-01-19T14:30:00.000Z",
      "metrics": {
        "vehicle_count": 95,
        "speed_distribution": {
          "0-15mph": 10,
          "16-30mph": 65,
          "31-45mph": 18,
          "46+mph": 2
        },
        "average_speed": 26.7,
        "vehicle_classification": {
          "small": 70,
          "medium": 20,
          "large": 5
        },
        "lane_change_events": 12,
        "following_distance": {
          "average": 2.8,  // seconds
          "minimum": 1.2,
          "violations": 3  // too close following
        }
      }
    },
    {
      // LiDAR sensor
      "sensor_id": "LIDAR-NYC-5AVE-42-04",
      "sensor_type": "lidar",
      "location": {
        "latitude": 40.7536,
        "longitude": -73.9832,
        "road_name": "5th Avenue",
        "mounting_height": 7.0  // meters
      },
      "timestamp": "2025-01-19T14:30:00.000Z",
      "metrics": {
        "vehicle_count": 88,
        "pedestrian_count": 42,
        "object_classification": {
          "vehicles": {
            "cars": 75,
            "buses": 5,
            "trucks": 8
          },
          "vulnerable_road_users": {
            "pedestrians": 42,
            "cyclists": 12,
            "motorcyclists": 3
          }
        },
        "trajectory_analysis": {
          "near_miss_events": 1,
          "irregular_movements": 2,
          "sudden_stops": 3
        },
        "spatial_measurements": {
          "average_vehicle_height": 1.6,  // meters
          "average_vehicle_length": 4.5,  // meters
          "road_clearance": 4.8  // meters
        }
      }
    },
    {
      // Bluetooth sensor
      "sensor_id": "BT-NYC-5AVE-42-05",
      "sensor_type": "bluetooth",
      "location": {
        "latitude": 40.7536,
        "longitude": -73.9832,
        "road_name": "5th Avenue"
      },
      "timestamp": "2025-01-19T14:30:00.000Z",
      "metrics": {
        "detected_devices": 156,
        "matched_pairs": 89,  // devices detected at paired sensor
        "travel_times": {
          "average": 185,  // seconds
          "minimum": 150,
          "maximum": 300,
          "std_deviation": 45
        },
        "origin_destination": {
          "route_id": "5AVE-42-to-5AVE-50",
          "completed_trips": 89,
          "average_speed": 18.5  // mph
        }
      }
    },
    {
      // Weather sensor
      "sensor_id": "WX-NYC-5AVE-42-06",
      "sensor_type": "weather",
      "location": {
        "latitude": 40.7536,
        "longitude": -73.9832,
        "road_name": "5th Avenue"
      },
      "timestamp": "2025-01-19T14:30:00.000Z",
      "metrics": {
        "temperature": 72.5,  // Fahrenheit
        "precipitation": {
          "rate": 0.0,  // inches per hour
          "type": "none"  // none, rain, snow, sleet
        },
        "wind": {
          "speed": 8.5,  // mph
          "direction": 180  // degrees
        },
        "visibility": 10.0,  // miles
        "road_surface": {
          "temperature": 75.2,  // Fahrenheit
          "condition": "dry",  // dry, wet, ice, snow
          "friction": 0.7
        }
      }
    }
  ],
    "metadata": {
    "batch_id": "BATCH-2025011914",
      "batch_timestamp": "2025-01-19T14:30:00.000Z",
        "data_quality": {
      "completeness": 0.98,
        "accuracy": 0.95,
          "latency": 250  // milliseconds
    }
  }
}