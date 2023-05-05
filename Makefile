build:
	docker build -t spasbot .
run:
	docker run -d -p 3000:3000 --name spasbot --rm spasbot