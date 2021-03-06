# ChickenBus-Backend

## Instructions
1. In Digital Ocean Droplet, Clone repository
2. npm install
3. pm2 start server.js

## API Documentation

### Get All Bus Routes
----
  Returns json data on all bus routes

* **URL**

  api/routes

* **Method:**

  `GET`

*  **URL Params**

    None

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{
        success: true,
        message: "Found routes",
        data: [
            {
                id : 4,
                geometry: {
                    coordinates: [lng, lat]
                },
                properties: {
                    name: "Managua to Masaya",
                    cost: 20,
                    departureTimes: [
                        sunday: [0700, 0800],
                        monday: [0700, 0800],
                        tuesday: ...
                    ],
                    duration: 50
                    notes: The bus has a lot of chickens on it
                    approved: true
                }
            },
            {
                id : 5,
                geometry: {
                    coordinates: [lng, lat]
                },
                properties: {
                    routes: [12, 44, 32]
                    approved: true
                }
            }
        ]
    }`

* **Error Response:**

  * **Code:** 404 NOT FOUND <br />
    **Content:** `{
        success: false,
        message: "No stops found"
     }`

### Update Bus Route
---
Updates Bus Route Info Based on ID

* **URL**

    api/routes/:id

* **Method:**

    `PUT`

*  **URL Params**

    id of Route to be updated

* **Data Params**

    json data of info to be updated

* **Success Response:**

* **Code:** 200 <br />
  **Content:** `{
      success: true,
      message: "Updated Route successfully",
      data: [
          {
              id : 4,
              geometry: {
                  coordinates: [lng, lat]
              },
              properties: {
                  name: "Managua to Masaya",
                  cost: 20,
                  departureTimes: [
                      sunday: [0700, 0800],
                      monday: [0700, 0800],
                      tuesday: ...
                  ],
                  duration: 50
                  notes: The bus has a lot of chickens on it
                  approved: true
              }
          },
          {
              id : 5,
              geometry: {
                  coordinates: [lng, lat]
              },
              properties: {
                  routes: [12, 44, 32]
                  approved: true
              }
          }
      ]
  }`

* **Error Response:**

* **Code:** 404 NOT FOUND <br />
  **Content:** `{
      success: false,
      message: "Route not found"
   }`

### Delete Bus Route
---
Deletes a Bus Route Based On ID

* **URL**

    api/routes/:id

* **Method:**

    `DELETE`

*  **URL Params**

    id of Route to be deleted

* **Data Params**

    None

* **Success Response:**

* **Code:** 200 <br />
  **Content:**

* **Error Response:**

* **Code:** 404 NOT FOUND <br />
  **Content:** `{
      success: false,
      message: "Route not found"
   }`


### Get All Bus Stops
----
  Returns json data on all stops

* **URL**

  api/stops

* **Method:**

  `GET`

*  **URL Params**

    None

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{
        success: true,
        message: "Found stops",
        data: [
            {
                id : 4,
                geometry: {
                    coordinates: [lng, lat]
                },
                properties: {
                    routes: [12, 44, 32]
                    approved: true
                }
            },
            {
                id : 5,
                geometry: {
                    coordinates: [lng, lat]
                }
                properties: {
                    routes: [12, 44, 32]
                    approved: true
                }
            }
        ]
    }`

* **Error Response:**

  * **Code:** 404 NOT FOUND <br />
    **Content:** `{
        success: false,
        message: "No stops found"
     }`


### Get All Users
----
  Returns json data on all users

* **URL**

  api/users

* **Method:**

  `GET`

*  **URL Params**

    None

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{
        success: true,
        message: "Found users",
        data: [
            {
                id : 12,
                username: "John19",
                email: "john19@email.com",
                permissionLevel: "0"
            },
            {
                id : 13,
                username: "Jim19",
                email: "jim19@email.com",
                permissionLevel: "1"
            }
        ]
    }`

* **Error Response:**

  * **Code:** 404 NOT FOUND <br />
    **Content:** `{
        success: false,
        message: "No users found"
     }`


### Get One User by ID
----
  Returns json data on one user

* **URL**

  api/users/:id

* **Method:**

  `GET`

*  **URL Params**

   **Required:**

   `id=[integer]`

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{
        success: true,
        message: "Found user",
        data: [
            {
                id : 12,
                username: "John19",
                email: "john19@email.com",
                permissionLevel: "0"
            }
        ]
    }`

* **Error Response:**

  * **Code:** 404 NOT FOUND <br />
    **Content:** `{
        success: false,
        message: "User not found"
     }`


### Get One User by Username
 ----
   Returns json data on one user

 * **URL**

   api/users/username/:username

 * **Method:**

   `GET`

 *  **URL Params**

    **Required:**

    `username=[string]`

 * **Data Params**

   None

 * **Success Response:**

   * **Code:** 200 <br />
     **Content:** `{
         success: true,
         message: "Found user",
         data: [
             {
                 id : 12,
                 username: "John19",
                 email: "john19@email.com",
                 permissionLevel: "0"
             }
         ]
     }`

 * **Error Response:**

   * **Code:** 404 NOT FOUND <br />
     **Content:** `{
         success: false,
         message: "User not found"
      }`
