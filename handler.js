const { ApolloServer, gql } = require('apollo-server-lambda');
const {makeRemoteExecutableSchema, mergeSchemas, introspectSchema } = require('graphql-tools');
const fetch = require('node-fetch');
const { HttpLink } = require('apollo-link-http');
const { config } = require('dotenv');

config()
const createRemoteSchema = async () => {
	const uri = 'https://api.yelp.com/v3/graphql';
	const headers = { Authorization: `bearer ${process.env.ACCESS_TOKEN}`};
	const link = new HttpLink({uri, fetch, headers});
	return makeRemoteExecutableSchema({
		schema: await introspectSchema(link),
		link
	});
};

let handler
module.exports.graphqlhandler = async (event,context, callback) => {
    if(handler == null) {
        const server = new ApolloServer({ schema: await createRemoteSchema() });
		handler = server.createHandler();
	} else {
		console.log("Already initialized")
	}
    
	context.callbackWaitsForEmptyEventLoop = false;
	return new Promise((resolve, reject) => {
			handler(event, context, callback);
	});
}
