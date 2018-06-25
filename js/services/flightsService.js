let flightService = (() => {
    function getAllFlights() {
        let endpoint = 'flights?query={"isPublished":"true"}';
        return remote.get('appdata', endpoint, 'kinvey')
    }

    function createFlights(destination,origin,departure,seats,cost,img,isPublished) {
        let data = {destination,origin,departure,seats,cost,img,isPublished}
    let endpoint = 'flights'
        return remote.post('appdata',endpoint,'kinvey',data);
    }
    function getFlightsById(flightId) {
        let endpoint = `flights/${flightId}`
        return remote.get('appdata',endpoint,'kinvey')
    }
    function editFlight(postId,destination,origin,departure,seats,cost,img,isPublished) {
        let endpoint = `flights/${postId}`;
        let data = {destination,origin,departure,seats,cost,img,isPublished};
        return remote.update('appdata',endpoint,'kinvey',data)
    }
    function getMyFlights(userId) {
        let endpoint = `flights?query={"_acl.creator":"${userId}"}`;
        return remote.get('appdata',endpoint,'kinvey')

    }
    
    return{
        getAllFlights,
        createFlights,
        getFlightsById,
        editFlight,
        getMyFlights
    }
})();