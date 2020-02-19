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


$(OUTPUT_FILE): template.yml sync-test-function/lambda.js
	aws s3api head-bucket --bucket $(DEPLOYMENT_BUCKET) $(AWS_ARGS) || \
		aws s3api create-bucket $(AWS_ARGS) --bucket $(DEPLOYMENT_BUCKET) $(BUCKET_LOCATION)
	
	aws cloudformation package --template-file $< --output-template-file $@ \
		--s3-bucket $(DEPLOYMENT_BUCKET) $(AWS_ARGS)

deploy: $(OUTPUT_FILE)
	aws cloudformation deploy --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND \
	--template-file $< \
	--stack-name $(STACK_NAME) $(AWS_ARGS) $(PARAMETER_OVERRIDES)

logs:
	sam logs --stack-name $(STACK_NAME) -n SyncTestFunction $(AWS_ARGS) 

web-config.yml: $(OUTPUT_FILE)
	aws cloudformation  describe-stacks \
		--stack-name $(STACK_NAME) $(AWS_ARGS) \
		--query Stacks[].Outputs[] --output text | awk '//{print $$1 ": " $$2}' > $@
	echo "ApiKey: " $(shell key=`aws cloudformation  describe-stacks \
		--stack-name $(STACK_NAME) $(AWS_ARGS) \
		--query "Stacks[].Outputs[?OutputKey=='ApiKeyId'].OutputValue" --output text`; \
		aws apigateway get-api-keys --query "items[?id=='$$key'].value" \
			$(AWS_ARGS) --include-values --output text
	) >> $@
node_modules/aws-sdk/dist/aws-sdk.min.js:
	npm install

jekyll/vendor/aws-sdk.min.js: node_modules/aws-sdk/dist/aws-sdk.min.js
	mkdir -p jekyll/vendor
	cp $< $@

web: web-config.yml jekyll/vendor/aws-sdk.min.js
	jekyll serve -s jekyll -c $<

clean:
	rm -rf $(OUTPUT_FILE) web-config.yml jekyll/vendor

undeploy:
	aws cloudformation delete-stack --stack-name $(STACK_NAME) $(AWS_ARGS)

.PHONY: deploy deployment-bucket clean logs web undeploy

