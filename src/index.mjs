#!/usr/bin/env node

import cli from './Bootstrap/cli.mjs';

(async () => {
    "use strict";
    
    await cli();
})();
