// Source - https://stackoverflow.com/a/68748610
// Posted by Shiv, modified by community. See post 'Timeline' for change history
// Retrieved 2026-09-15, License - CC BY-SA 4.0

export default {
    apps: [
        {
            name: "bhcais",
            script: "./src/main.ts",
	    interpreter: "ts-node",
	    interpreter_args: "-P ./tsconfig.json",
            env: {
                NODE_ENV: "development"
            },
            env_production: {
		NODE_ENV: "production",
	        TS_NODE_TRANSPILE_ONLY: 'true',
  		HOST: '0.0.0.0',
		PORT: 5173
            }
        }
    ]
}

