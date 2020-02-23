'use strict'

module.exports = {
    name: 'PlutoraBitbucketWebHookReciever',
    version: '0.0.0.1',
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    plutora: {
        dev_branches: ['DEV-AQUAMARINE','DEV-PLATFORMS', 'DEV-RELEASE','DEV-API','DEV-DIAMOND', 'develop'],
        feature_branch_prefix: 'DEV-FEATURE-'
    },
    jira: {
        url: 'https://plutora.atlassian.net',
        // official Jira Issue Reg Ex - https://confluence.atlassian.com/stashkb/integrating-with-custom-jira-issue-key-313460921.html
        issueRegEx: /((?<!([A-Z]{1,10})-?)[A-Z]+-\d+)/g,
        statuses: {
            // id can be retrieved from /rest/api/2/issue/:issueId:/transitions
            prApproved: 191, 
            merged: 31
        },
        qa: {
            // user ids can be retrieved from /rest/api/3/user/assignable/search
            PCO: [{id: '5c4796be81ec9e450cead1e2', name: 'Rubesh Kunwar'}], 
            GCT: [{id: '557058:3195e0c0-e752-41bd-91c6-6ab8b0d5fabd', name: 'Eugenia Rubleva'}],
            WAO: [{id: '557058:d6cb734f-b82f-482f-aae4-2a8cbc6a1416', name: 'Eiki Takahashi'}],
            BI: [{id: '557058:b9f1d8b3-2223-45da-8987-4a8ae9c7e3ea', name: 'Priya Chandrashekar'}],
        }
    },
    // generate api token to access Jira Rest API https://id.atlassian.com/manage/api-tokens
    creds: {
        username: 'autotransition@plutora.com',
        apiToken: 'V2ai5fTrgzdD6UrVRVtoA6FD',
    }
}
