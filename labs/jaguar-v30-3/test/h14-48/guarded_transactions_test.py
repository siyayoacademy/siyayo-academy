"""Repeat all H14.46 transactional scenarios with H14.48 DB boundary installed."""
from pathlib import Path
import sys
import unittest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'h14-46'))
import transactional_lab_test as original
from single_write_boundary import install

class GuardedTransactions(original.Transactions):
    def setUp(self):
        super().setUp()
        self.assertTrue(install(self.path,enabled=True)['ok'])

if __name__=='__main__': unittest.main()
