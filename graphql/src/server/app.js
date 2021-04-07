const express = require("express");
const { ApolloServer, PubSub } = require("apollo-server-express");
const fs = require("fs");
const path = require("path");
const { createServer } = require("http");

const { students, photos } = require("./db");

const typeDefs = fs.readFileSync(path.join(__dirname, "./typeDefs.graphql"), {
  encoding: "utf-8"
});

// const pubsub = new PubSub();

const resolvers = {
  Query: {
    allStudents: (parent, args, yy) => {
		console.warn('rfd parent', parent, args, yy)
      return students;
    },
    allPhotos: () => {
      return photos;
    }
  },
  Mutation: {
    postPhoto: async (parent, args, { pubsub }) => {
		console.warn('rfd ',args.input, args.input.url)
      await Promise.resolve();
      pubsub.publish("photo-add", { newPhoto: photos[0] });
      return photos[1];
    }
  },
  Subscription: {
    newPhoto: {
      subscribe: (parent, args, { pubsub }) => {
        return pubsub.asyncIterator("photo-add");
      }
    }
  },
  Student: {
    isGood: parent => {
      return parent.grade > 90;
    }
  },
  Photo: {
    postedBy: photo => {
      return students.find(item => item.id === photo.postedBy);
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  subscriptions: {
   path: '/subscriptions',
   onConnect: (connectionParams, webSocket, context) => {
	 console.log('Client connected');
   },
   onDisconnect: (webSocket, context) => {
	 console.log('Client disconnected')
   },
 },
  context: {
    hello: "123",
    pubsub:  new PubSub(),
  }
});

const app = express();
const httpServer = createServer(app);

server.installSubscriptionHandlers(httpServer);

server.applyMiddleware({ app });

httpServer.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);
