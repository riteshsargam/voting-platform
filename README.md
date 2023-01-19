# The Voting Application

This is an Online Voting Application built using NodeJs and ExpressJS using the EJS View Engine
- Database -> *postgresql* Database.
- Authentication -> PassportJS for Local Authentication.
- ORM -> Sequelize

## Visit The Application

The Application is Deployed on Render.com - [click here to visit](https://voting-app-uw8b.onrender.com/)

This Application is build around Two Personas
1. Election Admin - Create/Hosts Elections with Questions to Answer
2. Voter - Is Given a VoterID and Password to Vote in elections

## The Database Model

![Database Model](/images/VotingDB.png)

## Election Admin

The Election Admin can Create number of Elections and Manage Voters in each election.

Election Admin can launch Election and get a **public URL** which can be shared with voters.

Election Admin can Create Multiple choice Questions with number of options but each question has to have atleast 2 options.

Election Admin can preview results of election as the election is Going on and Can End election at any time. Election Admin cannot change Questions and Options once the election is launched but can add or Delete Voters.


## Voter

The Voter is Given a VoterID and password with which they can access and vote in an Election.

Each Voter can only vote in an Election Once.

Voter can see the results only after the Election Ends.

Voter can either visit the PUBLIC URL given by Election Admin or directly login to Vote in assigned Election.


## Election Admin Pages - Screenshots

#### **Displays All Election**
![Elections Page](/images/Elections.jpg)

#### **Election Page**
![Specific Election Page](/images/election.jpg)

#### **Voters Page**
![Voters Page](/images/voters.jpg)

#### **Question Page**
![Questions Page](/images/questions.jpg)

#### Results Page
![Results Page](/images/results.jpg)

## Voter Pages - Screenshots

#### Voter Voting Page
![Voting Page](/images/voting.jpg)


## Application Replication

Application Software Requirements
- POSTGRESQL 

1. Install Postgresql locally from [here](https://www.postgresql.org/download/)

2. Run these Commnads in CMD or Terminal
    ```
    git clone https://github.com/riteshsargam/voting-platform.git
    cd Voting_app
    npm i
    npm i --save-dev
    ```
3. We have to create DATABASE locally and Migrate.
    ```
    npx sequelize-cli db:create
    npx sequelize-cli db:migrate
    ```
4. Start the server
    ```
    node index.js
    or 
    npm run dev
    ```
4. Visit http://localhost:3000 after Server Start.