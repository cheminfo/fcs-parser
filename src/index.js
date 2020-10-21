import { IOBuffer } from 'iobuffer';

/**
 * Parse the FCS data contained in the file.
 * @param {buffer} file - File with the FCS data.
 * @return {Object} [Object.text] Metadata of the experiment.
 * @return {Array} [Object.parameters] Data of the parameters.
 * @return {Array} [Object.data] Data of each event.
 */

export function parseFCS(file, options = {}) {
  let { delimiter = undefined } = options;

  const buffer = new IOBuffer(file);
  const {
    model,
    textBegin,
    textEnd,
    dataBegin,
    dataEnd,
    analysisBegin,
    analysisEnd,
  } = getHeader(buffer);

  delimiter = delimiter === undefined ? getDelimiter(buffer) : delimiter;
  const textFile = buffer.readChars(textEnd - textBegin).split(delimiter);
  const textLack = buffer.offset - textEnd;
  let textSegment = {
    model: model,
    textBegin: textBegin,
    textEnd: textEnd,
    dataBegin: dataBegin,
    dataEnd: dataEnd,
    analysisBegin: analysisBegin,
    analysisEnd: analysisEnd,
  };

  for (let i = 0; i < textFile.length / 2 - 1; i++) {
    textSegment[textFile[i * 2]] = textFile[i * 2 + 1];
  }

  textSegment.dataBegin = Number.isNaN(dataBegin)
    ? parseInt(textSegment.$BEGINDATA, 10)
    : dataBegin;

  textSegment.dataEnd = Number.isNaN(dataEnd)
    ? parseInt(textSegment.$ENDDATA, 10)
    : dataEnd;

  const endianness = textSegment.$BYTEORD;

  if (endianness === '1,2,3,4') {
    buffer.setLittleEndian();
  } else if (endianness === '4,3,2,1') {
    buffer.setBigEndian();
  } else {
    throw new RangeError(`Unrecognized ${endianness} endianness`);
  }

  const numberOfEvents = parseInt(textSegment.$TOT, 10);
  const parametersByEvent = parseInt(textSegment.$PAR, 10);

  buffer.skip(dataBegin - textEnd - textLack);
  let dataSegment = [];
  const dataType = textSegment.$DATATYPE;
  if (dataType === 'I') {
    for (let i = 0; i < numberOfEvents; i++) {
      let event = new Float64Array(parametersByEvent);
      for (let j = 0; j < parametersByEvent; j++) {
        event[j] = buffer.readUint16();
      }
      dataSegment[i] = event;
    }
  } else if (dataType === 'F') {
    for (let i = 0; i < numberOfEvents; i++) {
      let event = new Float64Array(parametersByEvent);
      for (let j = 0; j < parametersByEvent; j++) {
        event[j] = buffer.readFloat32();
      }
      dataSegment[i] = event;
    }
  } else if (dataType === 'D') {
    for (let i = 0; i < numberOfEvents; i++) {
      let event = new Float64Array(parametersByEvent);
      for (let j = 0; j < parametersByEvent; j++) {
        event[j] = buffer.readFloat64();
      }
      dataSegment[i] = event;
    }
  } else {
    throw new RangeError(`Not supported $DATATYPE ${dataType}`);
  }

  return {
    data: dataSegment,
    text: textSegment,
    parameters: getParameters(textSegment),
  };
}

function getHeader(buffer) {
  const model = buffer.readChars(6);
  const textBegin = parseInt(buffer.readChars(12), 10);
  const textEnd = parseInt(buffer.readChars(8), 10);
  const dataBegin = parseInt(buffer.readChars(8), 10);
  const dataEnd = parseInt(buffer.readChars(8), 10);
  const analysisBegin = parseInt(buffer.readChars(8), 10);
  const analysisEnd = parseInt(buffer.readChars(8), 10);

  return {
    model,
    textBegin,
    textEnd,
    dataBegin,
    dataEnd,
    analysisBegin,
    analysisEnd,
  };
}

function getParameters(metadata) {
  const entries = Object.entries(metadata);
  const keys = entries.filter(
    (item) => (item[0][1] === 'P') & !Number.isNaN(parseInt(item[0][2], 10)),
  );
  const regex = /[a-zA-Z]+|[0-9]+(?:\.[0-9]+|)/g;
  const parametersData = Math.max(
    ...keys.map((item) => item[0].match(regex)[1]),
  );
  let parameters = [];
  for (let i = 1; i < parametersData + 1; i++) {
    const chanelKeys = keys.filter(
      (item) => parseInt(item[0].match(regex)[1], 10) === i,
    );
    let parameter = {};
    for (let j = 0; j < chanelKeys.length; j++) {
      parameter[chanelKeys[j][0]] = chanelKeys[j][1];
    }
    parameters.push(parameter);
  }
  return parameters;
}

function getDelimiter(buffer) {
  let delimiter = buffer.readChar().split(' ');
  while (delimiter[1] !== undefined) {
    delimiter = buffer.readChar().split(' ');
  }
  return delimiter;
}
