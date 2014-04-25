PHP=$(shell which php)
CURL=$(shell which curl)
HOST=localhost
PORT=9999

all: test

setup:
	$(PHP) -r "eval('?>'.file_get_contents('https://getcomposer.org/installer'));"
	$(CURL) -SslO https://raw.github.com/brtriver/dbup/master/dbup.phar
	$(CURL) -SslO http://cs.sensiolabs.org/get/php-cs-fixer.phar
	$(CURL) -SslO https://phar.phpunit.de/phpunit.phar
install: setup
	$(PHP) composer.phar install
	$(PHP) vendor/bin/testrunner compile -p vendor/autoload.php
update:
	$(PHP) composer.phar update
test:
	$(PHP) phpunit.phar --exclude-group study1 --bootstrap ./vendor/autoload.php -c ./phpunit.xml ./tests
fixer:
	$(PHP) php-cs-fixer.phar fix ./src --level=all
server:
	$(PHP) -S $(HOST):$(PORT) -t ./public_html
mig-up:
	$(PHP) dbup.phar up
