SHELL=/bin/sh
CWD := $(shell pwd)
STACK_NAME ?= sls-inquisitor-test
DEPLOYMENT_BUCKET ?= $(STACK_NAME)-deployment-$(AWS_REGION)

ifneq (,$(PROVISIONED_INSTANCES))
	OVERRIDES += ProvisionedInstances=$(PROVISIONED_INSTANCES)
endif
ifneq (,$(MEMORY_SIZE))
	OVERRIDES += MemorySize=$(MEMORY_SIZE)
endif
ifneq (,$(OVERRIDES))
	PARAMETER_OVERRIDES = --parameter-overrides $(OVERRIDES)
endif
ifneq (,$(AWS_PROFILE))
	AWS_ARGS += --profile $(AWS_PROFILE)
endif


OUTPUT_FILE := output.yml

ifneq (,$(AWS_REGION))
	AWS_ARGS += --region $(AWS_REGION)
	BUCKET_LOCATION = --create-bucket-configuration LocationConstraint=$(AWS_REGION)
	OUTPUT_FILE := output-$(AWS_REGION).yml
endif


$(OUTPUT_FILE): template.yml sync-test-function/lambda.js web-site/vendor/aws-sdk.min.js web-site/index.html
	aws s3api head-bucket --bucket $(DEPLOYMENT_BUCKET) $(AWS_ARGS) || \
		aws s3api create-bucket $(AWS_ARGS) --bucket $(DEPLOYMENT_BUCKET) $(BUCKET_LOCATION)
	
	aws cloudformation package --template-file $< --output-template-file $@ \
		--s3-bucket $(DEPLOYMENT_BUCKET) $(AWS_ARGS)

deploy: $(OUTPUT_FILE)
	aws cloudformation deploy --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND \
	--template-file $< \
	--stack-name $(STACK_NAME) $(AWS_ARGS) $(PARAMETER_OVERRIDES)

	aws cloudformation  describe-stacks \
		--stack-name $(STACK_NAME) $(AWS_ARGS) \
		--query Stacks[].Outputs[] --output text 
logs:
	sam logs --stack-name $(STACK_NAME) -n SyncTestFunction $(AWS_ARGS) 

node_modules/aws-sdk/dist/aws-sdk.min.js:
	npm install

web-site/vendor/aws-sdk.min.js: node_modules/aws-sdk/dist/aws-sdk.min.js
	mkdir -p web-site/vendor
	cp $< $@

clean:
	rm -rf output*.yml web-config.yml web-site/vendor

undeploy:
	aws cloudformation delete-stack --stack-name $(STACK_NAME) $(AWS_ARGS)

.PHONY: deploy deployment-bucket clean logs web undeploy

