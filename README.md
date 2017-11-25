# ChickenBus-Backend

## Instructions
1. Clone repository
2. In project directory run npm install
3. Get Carolina Cloud Apps CLI tools installed on your machine: https://help.unc.edu/help/carolina-cloudapps-installing-the-command-line-cli-tools/
4. Run `oc login` to authenticate with cloudapps
5. Run `oc get pods` to get list of running pods and copy the mongodb pod name
6. Run `oc port-forward (mongodb pod name) 27017:27017` to start port forwarding to cloudapps db
7. Run `npm run dev`

Note: `npm start` is used for production and will not work on local machine

## API Documentation

### Get All Bus Routes
----
  Returns json data on all bus routes

* **URL**

  /routes

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

### Get All Bus Stops
----
  Returns json data on all stops

* **URL**

  /stops

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


**Get All Users**
----
  Returns json data on all users

* **URL**

  /users

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


**Get One User By ID**
----
  Returns json data on one user

* **URL**

  /users/:id

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


 **Get One User By Username**
 ----
   Returns json data on one user

 * **URL**

   /users/username/:username

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
