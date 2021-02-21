import { GraphQLScalarType, Kind } from "graphql";

export default {
  DateScalar: new GraphQLScalarType({
    name: "Date",
    description: "Date custom scalar type",
    /*
     * Serialize method converts the scalar's back-end representation to a
     * JSON-compatible format so Apollo Server can include it in
     * an operation response.
     */
    serialize(value) {
      return value.toISOString(); // Convert outgoing Date to integer for JSON
    },
    /**
     * ParseValue Converts the scalar's serialized JSON value to its back-end
     * representation
     */
    parseValue(value) {
      return new Date(value); // Convert incoming value to Date
    },

    /**
     * ParseLiteral method to convert the value's AST representation
     * (which is always a string) to the JSON-compatible format expected
     * by the parseValue method (the example above expects an integer).
     */
    parseLiteral(ast) {
      if (ast.kind === Kind.INT || ast.kind === Kind.STRING)
        return new Date(ast.value);

      return null; // Invalid hard-coded value (not an integer nor an String)
    },
  }),
};
