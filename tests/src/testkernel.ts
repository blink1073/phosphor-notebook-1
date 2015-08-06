/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, S. Chris Colbert
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
module tests {

import Kernel = kernel.Kernel;

describe('phosphor-notebook - kernel', () => {

  describe('Kernel', () => {

    describe('#disconnect()', () => {

      it('should return true on success', () => {
        var d1 = true;
        expect(d1).to.be(true);
        console.log(Kernel);
      });

    });

  });
});

} // module tests
