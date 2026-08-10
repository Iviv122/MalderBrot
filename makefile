main:
	em++ -sSHARED_MEMORY=1 -flto -O3 -lembind -o lib.js lib.cpp
dev:
	em++ -sSHARED_MEMORY=1 -sASSERTIONS -O3 -lembind -o lib.js lib.cpp

