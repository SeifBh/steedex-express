<?php

namespace ApiBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;

class DefaultController extends Controller
{
    public function indexAction()
    {
        $em=$this->getDoctrine()->getManager();
        $users=$em->getRepository("UserBundle:User")->findAll();

        $view = $this->view($users,200);
        return $this->handleView($view);
    }
}
