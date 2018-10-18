const fs = require( 'fs' );
const request = require( 'request-promise' );

const getAvgAge = array => {
  let ages = array.map( person => person.age );
  let avg = Math.floor( ages.reduce( ( acumulator, current, index,
    currentReduced ) => {
    return acumulator + ( current / currentReduced.length )
  }, 0 ) );
  return avg;
}

const getPayload = array => {
  let fullnames = ( array.map( person => person.name ).sort() );
  let lastnames =  fullnames.map( person => {return person.split(' ').slice(-1).join(' ')}) ;
  let payload = lastnames.map( ( name ) => name[ 0 ] ).join( '' )
  return payload;
}

const base64Encode = file => {
  let bitmap = fs.readFileSync( file );
  let buffer = bitmap.toString( 'base64' );
  return buffer;
}

const writeResults = (data, filename) =>{
  let output = JSON.stringify(data);

  fs.writeFile(filename, output, 'utf8',  err => {
      if (err) {
        return console.log(err);
      }
      console.log("The file was saved!");
  }); 
}

const getDataServer = ( url, array ) => {
  return request( url, {
      json: true
    } )
    .then( body => {
      array.push( body );
      console.log('getting more data...')
      return getDataServer( url, array );
    } )
    .catch( err => {
      console.log( err );
      return array;
    } );
}

request ( 'http://13.58.37.162?email=hello@joelbarranco.io', { json: true})
.then( tokenRequest =>{
  let token = tokenRequest.token;
  
  getDataServer( 'http://13.58.37.162/data?token=' + token , [] )
  .then( people => {
    let allPeople = people;
    let age = getAvgAge(allPeople);
    let payload = getPayload(allPeople);
    let code = base64Encode('./server.js');

    let result = {
      age: age,
      payload: payload,
      code: code
    };

    writeResults(result, './results.json');

    let options = {
      method: 'POST',
      uri: 'http://13.58.37.162/result?token=' + token,
      body: result,
      json: true 
    };

    request(options)
    .then( postResponse => {
      console.log('success response!!!');
      writeResults(postResponse, './postResponse.json');
    })
    .catch( err => {
      console.log(err);
    });   
  }); 
});



