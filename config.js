'use strict'

module.exports = {
    name: 'PlutoraBitbucketWebHookReciever',
    version: '0.0.0.1',
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    plutora: {
        dev_branches: ['master','DEV-RUBY'],
        feature_branch_prefix: 'DEV-FEATURE-'
    },
    jira: {
        url: 'https://testpetr.atlassian.net',
        issueRegEx: /((?<!([A-Z]{1,10})-?)[A-Z]+-\d+)/g, // official Jira Issue Reg Ex - https://confluence.atlassian.com/stashkb/integrating-with-custom-jira-issue-key-313460921.html?_ga=2.203384471.708255576.1582337364-28417654.1581479138
        statuses: {
            prApproved: 21,
            merged: 31
        },
        qa: {
            TEST: [{id: '5e4eff303011ed0c8f8b25a2', name: 'Petr Savchenko'}]
        }
    },
    creds: {
        username: 'petr.savchenko@hotmail.com',
        apiToken: 'V2ai5fTrgzdD6UrVRVtoA6FD',
    }
}
