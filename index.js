const config = require('./config');
const express = require('express')
const bodyParser = require('body-parser');
const request = require('request');

const app = express()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/toPrApproved', (req, res) => {
    if (!req || !req.body || !req.body.pullrequest) {
        console.log('request is invalid');
        res.status(400).send('request is invalid');
        return;
    }

    const pullrequest = req.body.pullrequest;

    if (pullrequest.participants.filter(p => p.approved).length < 1) {
        res.status(202).send('not enough approvers');
        return;
    }

    const bodyData = `{
        "transition": {
            "id": ${config.jira.prApprovedStatusId} 
        }
    }`;

    const title = pullrequest.rendered.title.raw;
    const matchesArray = title.match(config.jira.issueRegEx);

    if (matchesArray.length !== 1) {
        console.log('jira issue id was not found in the pull request title');
        res.status(400).send('jira issue id was not found in the pull request title');
        return;
    }

    var issueId = matchesArray[0];

    var options = {
        method: 'POST',
        url: `${config.jira.url}/rest/api/3/issue/${issueId}/transitions`,
        auth: { username: config.creds.username, password: config.creds.apiToken },
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        body: bodyData
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        console.log(
            'Response: ' + response.statusCode + ' ' + response.statusMessage
        );
        console.log(body);
        res.sendStatus(response.statusCode);
    });
});

app.listen(config.port, () => console.log(`Example app listening on port ${config.port}!`));