export const organizationSchema = {
  bsonType: 'object',
  required: ['name'],
  properties: {
    name: {
      bsonType: 'string',
      description: 'Organization name - required'
    },
    description: {
      bsonType: ['string', 'null'],
      description: 'Optional organization description'
    },
    maxMembers: {
      bsonType: ['int', 'null'],
      minimum: 1,
      description: 'Optional maximum number of members'
    },
    customDomain: {
      bsonType: ['string', 'null'],
      pattern: '^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\\.)+[a-zA-Z]{2,}$',
      description: 'Optional custom domain'
    }
  }
};
