<?php

namespace ReclamationBundle\Tests\Controller;

use ReclamationBundle\Entity\Reclamation;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Bundle\FrameworkBundle\Tests\TestCase;

class DefaultControllerTest extends WebTestCase
{
    public function testIndex()
    {

        $reclamation = new Reclamation();
        $this->assertSame(0, $reclamation->getId());
    }
}
