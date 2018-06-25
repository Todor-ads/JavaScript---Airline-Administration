$(() => {
    const app = Sammy('#container', function () {
        this.use('Handlebars', 'hbs');

        this.get('#/home', getWelcomePage);
        this.get('index.html', getWelcomePage);

        this.get('#/register',(ctx)=>{
            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                registerForm: './templates/forms/loginForm.hbs',
            }).then(function () {
                this.partial('./templates/forms/registerForm.hbs');
            })
        })
        this.post('#/register',(ctx)=>{

            let username = ctx.params.username;
            let password = ctx.params.pass;
            let repeatPass = ctx.params.checkPass;
            if (!/^[A-Za-z0-9]{5,}$/.test(username)) {
                notify.showError('Username should be at least 5 characters long');
            }
            else if (!/^[A-Za-z\d]{1,}$/.test(password)) {
                notify.showError('Password should be at least 6 characters long and contain only english alphabet letters');
            } else if (repeatPass !== password) {
                notify.showError('Passwords must match!');
            }else {
                auth.register(username, password)
                    .then((userData) => {
                        auth.saveSession(userData);
                        notify.showInfo('User registration successful!');
                        ctx.redirect('#/catalog');
                    })
                    .catch(notify.handleError);
            }

        })
        this.post('#/login',(ctx)=>{
            let username = ctx.params.username;
            let password = ctx.params.pass;

            if (username === '' || password === '') {
                notify.showError('All fields should be non-empty!');
            } else {
                auth.login(username, password)
                    .then((userData) => {
                        auth.saveSession(userData);
                        notify.showInfo('Login successful.');
                        ctx.redirect('#/catalog');
                    })
                    .catch(notify.handleError);
            }
        })

        this.get('#/catalog',(ctx)=>{

            flightService.getAllFlights()
                .then((flights)=>{
                    ctx.name = sessionStorage.getItem('username')
                ctx.name = sessionStorage.getItem('username')
                ctx.isAuth = auth.isAuth();
                ctx.img = flights.img;
                ctx.destination = flights.destination;
                ctx.origin= flights.origin;
                ctx.postId = flights._id;
                ctx.flights = flights;

                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        flights: './templates/home/flights.hbs'
                    }).then(function () {
                        this.partial('./templates/home/listAllFlights.hbs')
                    })
                })
        })
        this.get('#/flights/addFlight',(ctx)=>{
            ctx.isAuth = auth.isAuth();
            ctx.name = sessionStorage.getItem('username')
            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs'
            }).then(function () {
                this.partial('./templates/forms/addFlight.hbs')
            })
        })
        this.post('#/flights/addFlight',(ctx)=>{
            console.log(ctx.params);
            let destination = ctx.params.destination;
            let origin = ctx.params.origin;
            let departure = ctx.params.departure;
            let seats = ctx.params.seats;
            let cost = ctx.params.cost;
            let img = ctx.params.img;
            let isPublished = false
            if(ctx.params.public == 'on'){
                isPublished = true;
            }



            flightService.createFlights(destination,origin,departure,seats,cost,img,isPublished)
                .then(()=>{
                notify.showInfo("Created flight.")
                    ctx.redirect('#/catalog')
                }).catch(()=>{
                notify.handleError()
            })
        })
        this.get('#/details/:postId',(ctx)=>{
            ctx.name = sessionStorage.getItem('username')
            let postId = ctx.params.postId;
            flightService.getFlightsById(postId)
                .then((flight)=>{
                    console.log('tuk');
                    ctx.isAuth = auth.isAuth();
                    ctx.postId = flight._id;
                ctx.img = flight.img;
                ctx.destination = flight.destination;
                ctx.departure = flight.departure;
                ctx.seats = flight.seats;
                ctx.cost = flight.cost;
                ctx.loadPartials({
                    header: './templates/common/header.hbs',
                    footer: './templates/common/footer.hbs',
                }).then(function () {
                    this.partial('./templates/viewDetails/flightDetails.hbs')
                })
            })
        })
        this.get('#/flights/editFlight/:postId',(ctx)=>{
            ctx.name = sessionStorage.getItem('username')
           let postId = ctx.params.postId
            flightService.getFlightsById(postId)
                .then((flights)=>{
               ctx.isAuth = auth.isAuth();
               ctx.flights = flights
               ctx.loadPartials({
                   header: './templates/common/header.hbs',
                   footer: './templates/common/footer.hbs'
               }).then(function () {
                   this.partial('./templates/forms/editFlights.hbs')
               })
                })
        })
        this.post('#/flights/editFlight',(ctx)=>{

            let postId = ctx.params.postId
            console.log(postId);
            let destination = ctx.params.destination;
            let origin = ctx.params.origin;
            let departure = ctx.params.departure;
            let seats = ctx.params.seats;
            let cost = ctx.params.cost;
            let img = ctx.params.img;
            let isPublished = false;
            if(ctx.params.public === 'on'){
                isPublished = true;
            }

            flightService.editFlight(postId,destination,origin,departure,seats,cost,img,isPublished)
                .then(()=>{
                    notify.showInfo("Successfully edited flight.");
                    ctx.redirect('#/catalog')
                }).catch(notify.showError)
        });
        this.get('#/logout',(ctx)=>{
            auth.logout()
                .then(()=>{

                sessionStorage.clear();
                ctx.redirect('#/home')
            })
        });

        this.get('#/Myflights',(ctx)=>{
            ctx.name = sessionStorage.getItem('username')
        flightService.getMyFlights(sessionStorage.getItem('userId'))
            .then((flights)=>{

                flights.forEach((f,i)=>{

                f.isAuthor = f._acl.creator === sessionStorage.getItem('username')
            });

            ctx.isAuth = auth.isAuth();
            ctx.flights = flights;

                ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                myFlight: './templates/viewDetails/myFlights.hbs'

            }).then(function () {
                this.partial('./templates/viewDetails/myFlightsList.hbs')
            })

            })

        });


        function getWelcomePage(ctx) {

            if (!auth.isAuth()) {
                ctx.loadPartials({
                    header: './templates/common/header.hbs',
                    footer: './templates/common/footer.hbs',
                    login: './templates/forms/loginForm.hbs',
                }).then(function () {
                    this.partial('./templates/welcome-anonymous.hbs');
                })
            } else {
                ctx.isAuth = auth.isAuth();
                ctx.redirect('#/catalog');
            }
        }
        // function postIsValid(title, url) {
        //     if (title === '') {
        //         notify.showError('Title is required!');
        //     } else if (url === '') {
        //         notify.showError('Url is required!');
        //     } else if (!url.startsWith('https:')) {
        //         notify.showError('Url must be a valid link!');
        //     } else {
        //         return true;
        //     }
        //
        //     return false;
        // }
        // function calcTime(dateIsoFormat) {
        //     let diff = new Date - (new Date(dateIsoFormat));
        //     diff = Math.floor(diff / 60000);
        //     if (diff < 1) return 'less than a minute';
        //     if (diff < 60) return diff + ' minute' + pluralize(diff);
        //     diff = Math.floor(diff / 60);
        //     if (diff < 24) return diff + ' hour' + pluralize(diff);
        //     diff = Math.floor(diff / 24);
        //     if (diff < 30) return diff + ' day' + pluralize(diff);
        //     diff = Math.floor(diff / 30);
        //     if (diff < 12) return diff + ' month' + pluralize(diff);
        //     diff = Math.floor(diff / 12);
        //     return diff + ' year' + pluralize(diff);
        //     function pluralize(value) {
        //         if (value !== 1) return 's';
        //         else return '';
        //     }
        // }
    });

    app.run();
});