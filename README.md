# Serverless Inquisitor

A simple app for testing request latency over API Gateway and Lambda functions.

### Prerequisites

* npm
* jekyll
* make


### Usage

1. Create a `.env` file (it will be ignored by git) with the following two properties:

* AWS_REGION - region where to deploy a stack
* AWS_PROFILE - profile to use when deploying

for example
```
AWS_PROFILE=claudia-test
AWS_REGION=eu-central-1
```

2. create a deployment bucket in the region where you want to test functions; you can create one with an automatically assigned name based on the stack you want to deploy using `make deployment-bucket STACK_NAME=some-stack-name` 

for example

```
make deployment-bucket STACK_NAME=perf-test
```

3. deploy the stack using `make deploy STACK_NAME=some-stack-name`

for example

```
make deploy STACK_NAME=perf-test
```


4. start the local web site based on the deployed stack


```
make web STACK_NAME=perf-test
```

## Clean up

You can delete temporarily generated files using `make clean`;

You can remove the deployed stack using `make undeploy STACK_NAME=perf-test`

## Customising

* modify [template.yml](template.yml) to change the Lambda function settings
* modify `.env` to deploy to a different region

