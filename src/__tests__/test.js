import fs from 'fs';
import { join } from 'path';

import { parseFCS } from '..';

/*
 * Files for test cases from:
    https://github.com/eyurtsev/fcsparser/tree/master/fcsparser/tests/data/FlowCytometers
 */

const readFileSync = fs.readFileSync;
const pathFiles = join(__dirname, '/../../data/');

describe('Version FCS_3.0', () => {
  const data = readFileSync(
    join(pathFiles, 'FCS_3.0_Fortessa_PBS_Specimen_001_A1_A01.fcs'),
  );

  it('Data from file should be consistant with events and parameters described in metadata', () => {
    const parsedFile = parseFCS(data);
    const textSegment = parsedFile.text;
    const dataSegment = parsedFile.data;
    const numberOfEvents = parseInt(textSegment.$TOT, 10);
    const totalParameters = parseInt(textSegment.$PAR, 10);
    expect(dataSegment).toHaveLength(numberOfEvents);
    expect(dataSegment[0]).toHaveLength(totalParameters);
  });

  it('Parameters length from metadata should be equal to $PAR keyword', () => {
    const parsedFile = parseFCS(data);
    const textSegment = parsedFile.text;
    const parameters = parsedFile.parameters;
    const totalParameters = parseInt(textSegment.$PAR, 10);
    expect(parameters).toHaveLength(totalParameters);
  });

  it('the number of bytes used in the data segment should be equal to the sum of the bytes used in the parameters for each event', () => {
    const parsedFile = parseFCS(data);
    const textSegment = parsedFile.text;
    const dataBegin = textSegment.dataBegin;
    const dataEnd = textSegment.dataEnd;
    const dataBytes = Math.round((dataEnd - dataBegin) / 4);
    const numberOfEvents = parseInt(textSegment.$TOT, 10);
    const totalParameters = parseInt(textSegment.$PAR, 10);
    expect(dataBytes).toStrictEqual(numberOfEvents * totalParameters);
  });
});

describe('Version FCS_2.0', () => {
  it('Testing file with dataType I', () => {
    const data = readFileSync(join(pathFiles, 'Sample_Well_A02.fcs'));
    const parsedFile = parseFCS(data);
    const textSegment = parsedFile.text;
    const dataBegin = textSegment.dataBegin;
    const dataEnd = textSegment.dataEnd;
    const dataBytes = Math.round((dataEnd - dataBegin) / 2);
    const numberOfEvents = parseInt(textSegment.$TOT, 10);
    const totalParameters = parseInt(textSegment.$PAR, 10);
    expect(dataBytes).toStrictEqual(numberOfEvents * totalParameters);
  });
});
