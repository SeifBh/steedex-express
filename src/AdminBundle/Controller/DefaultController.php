<?php

namespace AdminBundle\Controller;

use AppBundle\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function indexAction()
    {
        return $this->render('./default/test.html.twig', []);
    }

    public function adminAction()
    {

        // replace this example code with whatever you need
        return $this->render('@Admin/Default/admin.html.twig', []);
    }





}
