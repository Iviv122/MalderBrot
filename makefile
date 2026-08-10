main:
	em++ -sSHARED_MEMORY=1 -O3 -lembind -o lib.js lib.cpp
dev:
	em++ -sSHARED_MEMORY=1 -sASSERTIONS -O3 -lembind -o lib.js lib.cpp
low-pricise:
	em++ -sSHARED_MEMORY=1 -O3 -flto -ffast-math -lembind -o lib.js lib.cpp



