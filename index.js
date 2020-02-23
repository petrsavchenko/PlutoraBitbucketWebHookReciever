const config = require('./config');
const express = require('express')
const bodyParser = require('body-parser');
const request = require('request');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// called on 'Pull Request Approved' trigger in bitbucket
app.post('/pr_approved', (req, res) => {
    if (!req || !req.body || !req.body.pullrequest) {
        console.log('request is invalid');
        res.status(400).send('request is invalid');
        return;
    }

    // A user approves a pull request for a repository.
    // {pullrequest}: The approved pull request.
    // {participants}: A list of participants part of the pull request.
    // {title}: The name of the pull request.
    // see event payloads doc for more - https://confluence.atlassian.com/bitbucket/event-payloads-740262817.html
    const { participants, title } = req.body.pullrequest;

    if (participants.filter(p => p.approved).length < 1) {
        res.status(202).send('not enough approvers');
        return;
    }

    const issueId = parseIssueId(title);

    if (!issueId) {
        console.log('jira issue id was not found in the pull request title');
        res.status(400).send('jira issue id was not found in the pull request title');
        return;
    }

    updateJiraIssue({
        res,
        issueId,
        statusId: config.jira.statuses.prApproved,
    });
});

// called on any push to repo in bitbucket
app.post('/merged', (req, res) => {
    if (!req || !req.body || !req.body.push) {
        console.log('request is invalid');
        res.status(400).send('request is invalid');
        return;
    }

    // The details of the push, which includes the changes property. 
    // {new}: An object containing information about the state of the reference after the push. 
    // When a branch is deleted, new is null
    // {name}: The name of the branch, tag, named branch, or bookmark.
    // {target}: The details of the most recent commit after the push.
    // see event payloads doc for more - https://confluence.atlassian.com/bitbucket/event-payloads-740262817.html
    const push = req.body.push;

    if (push.changes.length === 1 && push.changes[0].new 
        && push.changes[0].new.target && push.changes[0].new.target.type === 'commit'
        // check if it was commit to dev or feature branch
        && (config.plutora.dev_branches.includes(push.changes[0].new.name) 
            || push.changes[0].new.name.startsWith(config.plutora.feature_branch_prefix))
        // check if it was 'merge' commit
        && push.changes[0].new.target.message.startsWith('Merged in '))
    {
        const issueId = parseIssueId(push.changes[0].new.target.message);

        if (!issueId) {
            console.log('jira issue id was not found in the merge commit message');
            res.status(400).send('jira issue id was not found in the merge commit message');
            return;
        }

        updateJiraIssue({
            res,
            issueId,
            statusId: config.jira.statuses.merged,
            assignee: findQaAssignee(issueId),
        });
        return;
    }

    res.status(202).send('no merges have been detected');
    return;
});

const parseIssueId = (text) => {
    const matchesArray = text.match(config.jira.issueRegEx);
    return matchesArray.length !== 1 ? null : matchesArray[0];
}

const updateJiraIssue = (params) => {
    const { res, issueId, statusId, assignee } = params;
    requestToJira({
        res,
        method: 'POST',
        url: `${config.jira.url}/rest/api/3/issue/${issueId}/transitions`,
        bodyData: `{
            "transition": {
                "id": ${statusId} 
            }
        }`,
        callback: assignee ? 
            () => { 
                requestToJira({
                    res,
                    method: 'PUT',
                    url: `${config.jira.url}/rest/api/3/issue/${issueId}/assignee`,
                    bodyData : `{
                        "accountId": "${assignee.id}"
                    }`
                })
            }
            : null
    });
}

const requestToJira = (params) => {
    const { res, method, url, bodyData, callback } = params;

    const options = {
        method,
        url,
        auth: { username: config.creds.username, password: config.creds.apiToken },
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        body: bodyData
    };

    request(options, (error, response, body) => {
        if (error) throw new Error(error);
        console.log(
            'Response: ' + response.statusCode + ' ' + response.statusMessage
        );
        console.log(body);
        
        if (callback) {
            callback()
        } else {
            res.status(response.statusCode).send(response.statusMessage);
        }
        
    });
}

const findQaAssignee = (issueId) => {
    const teamPrefix = issueId.split('-')[0];
    const qaList = config.jira.qa[teamPrefix];
    if (!qaList || qaList.length === 0) {
        console.log(`Qa for team ${teamPrefix} was not found`);
        return;
    }
    return qaList[Math.floor(Math.random() * qaList.length)];   
}

app.listen(config.port, () => console.log(`Example app listening on port ${config.port}!`));