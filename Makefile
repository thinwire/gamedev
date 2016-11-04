TSCOPTS = --outFile game.js --removeComments --sourceMap

all:
	tsc ${TSCOPTS} src/game.ts

clean:
	rm -f *.js *.js.map

dev:
	tsc ${TSCOPTS} src/game.ts --watch
