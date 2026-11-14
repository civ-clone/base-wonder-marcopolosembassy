import MarcoPolosEmbassy from '../MarcoPolosEmbassy';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Wonder from '@civ-clone/core-wonder/Wonder';
import { existsSync, readFileSync } from 'fs';
import { execFileSync } from 'child_process';
import { expect } from 'chai';
import { join } from 'path';
import { typeNameOf } from '@civ-clone/core-data-object/DataObject';

describe('MarcoPolosEmbassy', (): void => {
  it('should extend Wonder directly, a city improvement', (): void => {
    expect(Object.getPrototypeOf(MarcoPolosEmbassy)).to.equal(Wonder);
    expect(MarcoPolosEmbassy.prototype).to.be.instanceOf(CityImprovement);
  });

  it('should be saved by its own name', (): void => {
    expect(typeNameOf(MarcoPolosEmbassy)).to.equal('MarcoPolosEmbassy');
  });

  it('should be a library that registers nothing', (): void => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf8')
    );

    ['main', 'module', 'exports', 'bin'].forEach((field: string): void => {
      expect(packageJson).not.to.have.property(field);
    });
    expect(existsSync(join(process.cwd(), 'index.ts'))).to.be.false;
    expect(existsSync(join(process.cwd(), 'index.js'))).to.be.false;

    // Every module the package ships, compiled, as a plugin loader would load it, in a fresh process: the test runner
    //  may load the TypeScript source instead, and a registry that skips what it holds can't show a second
    //  registration.
    const counts = execFileSync(
      process.execPath,
      [
        '-e',
        [
          "const rules = require('@civ-clone/core-rule/RuleRegistry').instance;",
          "const buildItems = require('@civ-clone/core-city-build/AvailableCityBuildItemsRegistry').instance;",
          "require('./MarcoPolosEmbassy.js');",
          'console.log(JSON.stringify([rules.entries().length, buildItems.entries().length]));',
        ].join(' '),
      ],
      { cwd: process.cwd(), encoding: 'utf8' }
    );

    expect(JSON.parse(counts)).to.deep.equal([0, 0]);
  });

  it('should ship its TypeScript beside the compiled modules', (): void => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf8')
    );

    expect(packageJson.files).to.deep.equal([
      'MarcoPolosEmbassy.js',
      'MarcoPolosEmbassy.d.ts',
      'MarcoPolosEmbassy.js.map',
      'MarcoPolosEmbassy.ts',
    ]);
    (packageJson.files as string[]).forEach((file: string): void => {
      expect(existsSync(join(process.cwd(), file)), file).to.be.true;
    });
  });
});
